import pg from 'pg';

const { Pool } = pg;

declare global {
  var pgPool: pg.Pool | undefined;
}

let pool: pg.Pool;

const rawConnStr = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
let connStr = rawConnStr;
if (connStr && connStr.includes('sslmode=')) {
  connStr = connStr.replace(/[?&]sslmode=[^&]+/i, '');
  if (connStr.endsWith('?')) {
    connStr = connStr.slice(0, -1);
  }
}
const hostValue = process.env.DB_HOST || 'localhost';

const isLocalDb = () => {
  const isLocalHost = hostValue === 'localhost' || hostValue === '127.0.0.1';
  const isLocalUrl = connStr ? (connStr.includes('localhost') || connStr.includes('127.0.0.1')) : false;
  return isLocalHost || isLocalUrl;
};

const connectionConfig = {
  connectionString: connStr,
  ssl: !isLocalDb() ? {
    rejectUnauthorized: false
  } : false,
  host: connStr ? undefined : hostValue,
  port: connStr ? undefined : Number(process.env.DB_PORT || 5432),
  user: connStr ? undefined : (process.env.DB_USER || 'postgres'),
  password: connStr ? undefined : process.env.DB_PASSWORD,
  database: connStr ? undefined : (process.env.DB_NAME || 'activos_greenfield'),
  max: 20, // Soporte para múltiples consultas paralelas (Promise.all)
  idleTimeoutMillis: 30000, // Mantener conexiones calientes
  connectionTimeoutMillis: 5000,
  keepAlive: true,
};

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(connectionConfig);
} else {
  if (!global.pgPool) {
    global.pgPool = new Pool(connectionConfig);
  }
  pool = global.pgPool;
}

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Query ejecutado:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

let schemaEnsured = false;
let schemaPromise: Promise<void> | null = null;

export const ensureDatabaseSchema = async (): Promise<void> => {
  if (schemaEnsured) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          -- 1. Ampliar tipo_evento en historial_linea a VARCHAR(50) y actualizar constraint
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'historial_linea' AND column_name = 'tipo_evento'
            ) THEN
              ALTER TABLE historial_linea ALTER COLUMN tipo_evento TYPE VARCHAR(50);
              ALTER TABLE historial_linea DROP CONSTRAINT IF EXISTS historial_linea_tipo_evento_check;
              ALTER TABLE historial_linea ADD CONSTRAINT historial_linea_tipo_evento_check 
                CHECK (tipo_evento IN ('ASIGNACION', 'TRANSFERENCIA', 'CAMBIO_PLAN', 'CAMBIO_EQUIPO', 'EDICION', 'BAJA', 'REACTIVACION'));
            END IF;
          END $$;

          -- 2. Asegurar columnas de activo_id en linea y historial_linea
          ALTER TABLE linea ADD COLUMN IF NOT EXISTS activo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
          CREATE INDEX IF NOT EXISTS idx_linea_activo_id ON linea(activo_id);

          ALTER TABLE historial_linea ADD COLUMN IF NOT EXISTS activo_anterior_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
          ALTER TABLE historial_linea ADD COLUMN IF NOT EXISTS activo_nuevo_id BIGINT REFERENCES activo(id) ON DELETE SET NULL;
        `);
        schemaEnsured = true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('⚠️ Error asegurando esquema de BD:', error);
    } finally {
      schemaPromise = null;
    }
  })();

  return schemaPromise;
};

export const getClient = () => pool.connect();

export { pool };

export default pool;
