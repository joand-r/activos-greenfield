import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login de usuario
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Obtener perfil del usuario autenticado
// @access  Private
router.get('/me', verifyToken, getMe);

export default router;
