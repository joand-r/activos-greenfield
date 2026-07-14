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
  max: process.env.NODE_ENV === 'production' ? 3 : 10,
  idleTimeoutMillis: 15000, // Liberar conexiones inactivas más rápido en serverless
  connectionTimeoutMillis: 5000,
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

export const getClient = () => pool.connect();

export { pool };

export default pool;
