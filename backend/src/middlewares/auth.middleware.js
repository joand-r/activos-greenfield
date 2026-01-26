import jwt from 'jsonwebtoken';

// Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar userId al request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Error en verifyToken:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de admin
export const verifyAdmin = async (req, res, next) => {
  try {
    const { pool } = await import('../config/database.js');
    
    const result = await pool.query(
      'SELECT rol FROM usuario WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (result.rows[0].rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en verifyAdmin:', error);
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

// Middleware de logging
export const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

