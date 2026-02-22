import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración de la conexión a PostgreSQL
// Railway proporciona DATABASE_URL automáticamente al agregar PostgreSQL
// DATABASE_PUBLIC_URL es la URL pública accesible desde fuera de Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  // Configuración alternativa para desarrollo local
  host: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_PORT || 5432),
  user: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
  password: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'activos_greenfield'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Probar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

// Función helper para ejecutar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutado:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

// Obtener un cliente para transacciones
export const getClient = () => pool.connect();

// Exportar pool
export { pool };

export default pool;
