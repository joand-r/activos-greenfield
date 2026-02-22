import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// Middleware para verificar token JWT y cargar usuario completo

export const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario completo de la base de datos
    const result = await pool.query(
      'SELECT id, email, nombre, rol FROM usuario WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Agregar usuario al request
    req.user = result.rows[0];
    req.userId = decoded.id; // Mantener compatibilidad
    
    next();
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Alias para compatibilidad
export const verifyToken = authenticateToken;

// Middleware para verificar rol de admin
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol !== 'admin') {
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

