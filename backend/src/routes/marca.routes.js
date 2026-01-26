import express from 'express';
import {
  getMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
} from '../controllers/marca.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/marcas
// @desc    Obtener todas las marcas
// @access  Public
router.get('/', getMarcas);

// @route   GET /api/marcas/:id
// @desc    Obtener una marca por ID
// @access  Public
router.get('/:id', getMarcaById);

// @route   POST /api/marcas
// @desc    Crear nueva marca
// @access  Private/Admin
router.post('/', verifyToken, verifyAdmin, createMarca);

// @route   PUT /api/marcas/:id
// @desc    Actualizar marca
// @access  Private/Admin
router.put('/:id', verifyToken, verifyAdmin, updateMarca);

// @route   DELETE /api/marcas/:id
// @desc    Eliminar marca
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteMarca);

export default router;
