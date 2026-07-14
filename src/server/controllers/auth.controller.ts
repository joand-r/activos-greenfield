import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/database';

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el email ya existe
    const userExists = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar rol_id
    const rolNombre = (rol === 'superadmin' || rol === 'admin' || rol === 'Administrador') ? 'Administrador' : 'Operadora';
    const rolRes = await pool.query('SELECT id FROM roles WHERE nombre = $1', [rolNombre]);
    const rolId = rolRes.rows[0]?.id;

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, password, rol_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nombre, email, created_at`,
      [nombre, email, hashedPassword, rolId]
    );

    const user = result.rows[0];
    user.rol = rolNombre;

    res.status(201).json({
      user,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario con rol_id unido
    const result = await pool.query(
      `SELECT u.*, r.nombre AS rol 
       FROM usuario u 
       LEFT JOIN roles r ON u.rol_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        created_at: user.created_at
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.created_at 
       FROM usuario u 
       LEFT JOIN roles r ON u.rol_id = r.id 
       WHERE u.id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
