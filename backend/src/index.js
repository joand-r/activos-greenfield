import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import { loggerMiddleware } from './middlewares/auth.middleware.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import lugarRoutes from './routes/lugar.routes.js';
import marcaRoutes from './routes/marca.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import articuloRoutes from './routes/articulo.routes.js';
import movimientoRoutes from './routes/movimiento.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Configuración
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(loggerMiddleware);

// Verificar conexión a la base de datos al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL');
  }
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Activos Greenfield',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categorias: '/api/categorias',
      lugares: '/api/lugares',
      marcas: '/api/marcas',
      proveedores: '/api/proveedores',
      articulos: '/api/articulos',
      movimientos: '/api/movimientos',
      upload: '/api/upload'
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
app.use('/api/categorias', categoriaRoutes);
app.use('/api/lugares', lugarRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/articulos', articuloRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/upload', uploadRoutes);

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
