import express from 'express';
import {
  getLugares,
  getLugarById,
  getInicialesLugar,
  createLugar,
  updateLugar,
  deleteLugar
} from '../controllers/lugar.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/lugares
// @desc    Obtener todos los lugares
// @access  Public
router.get('/', getLugares);

// @route   GET /api/lugares/:id
// @desc    Obtener un lugar por ID
// @access  Public
router.get('/:id', getLugarById);

// @route   GET /api/lugares/:id/iniciales
// @desc    Obtener iniciales de un lugar
// @access  Public
router.get('/:id/iniciales', getInicialesLugar);

// @route   POST /api/lugares
// @desc    Crear nuevo lugar
// @access  Private/Admin
router.post('/', verifyToken, verifyAdmin, createLugar);

// @route   PUT /api/lugares/:id
// @desc    Actualizar lugar
// @access  Private/Admin
router.put('/:id', verifyToken, verifyAdmin, updateLugar);

// @route   DELETE /api/lugares/:id
// @desc    Eliminar lugar
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteLugar);

export default router;
