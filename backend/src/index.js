import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './config/database.js';
import { loggerMiddleware } from './middlewares/auth.middleware.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import marcaRoutes from './routes/marca.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import lugarRoutes from './routes/lugar.routes.js';
import activoRoutes from './routes/activo.routes.js';
import movimientoRoutes from './routes/movimiento.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';

// Configuración
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────
//  CORS — lista blanca estricta
//  En producción solo se permite el dominio de Netlify.
//  Agrega más orígenes separados por coma en ALLOWED_ORIGINS:
//    ALLOWED_ORIGINS=https://activos.netlify.app,https://mi-dominio.com
// ─────────────────────────────────────────────────────────────
const buildAllowedOrigins = () => {
  const base = ['http://localhost:3000', 'http://localhost:3002'];

  // Soporte para múltiples orígenes de producción separados por coma
  const fromEnv = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return [...base, ...fromEnv];
};

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, mobile apps internas)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origen bloqueado: ${origin}`);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Cachea la respuesta OPTIONS durante 10 min para reducir preflight requests
  maxAge: 600,
};

// Middlewares
app.use(cors(corsOptions));
// Responde automáticamente a los preflight requests (método OPTIONS)
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(loggerMiddleware);

// Verificar conexión y sembrar superadmin si no existe
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a PostgreSQL');

    // Crear superadmin automáticamente si no existe
    const SUPERADMIN_EMAIL = 'joandanielrr0@gmail.com';
    const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Creed9775';

    const existing = await pool.query(
      'SELECT id, rol FROM usuario WHERE email = $1',
      [SUPERADMIN_EMAIL]
    );

    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO usuario (nombre, email, password, rol)
         VALUES ($1, $2, $3, 'superadmin')`,
        ['Joan Daniel (Owner)', SUPERADMIN_EMAIL, hashed]
      );
      console.log('✅ Superadmin creado:', SUPERADMIN_EMAIL);
    } else if (existing.rows[0].rol !== 'superadmin') {
      await pool.query(
        'UPDATE usuario SET rol = $1 WHERE email = $2',
        ['superadmin', SUPERADMIN_EMAIL]
      );
      console.log('✅ Superadmin actualizado:', SUPERADMIN_EMAIL);
    } else {
      console.log('✅ Superadmin ya existe');
    }
  } catch (err) {
    console.error('❌ Error al inicializar DB:', err);
  }
})();


// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Activos Greenfield',
    status: 'running',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      upload: '/api/upload',
      marcas: '/api/marcas',
      proveedores: '/api/proveedores',
      lugares: '/api/lugares',
      activos: '/api/activos',
      movimientos: '/api/movimientos'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/lugares', lugarRoutes);
app.use('/api/activos', activoRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/superadmin', superadminRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Algo salió mal!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Documentación en http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  pool.end(() => {
    console.log('Pool de conexiones cerrado');
    process.exit(0);
  });
});

export default app;
