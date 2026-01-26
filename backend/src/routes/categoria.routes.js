import express from 'express';
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controllers/categoria.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/categorias
// @desc    Obtener todas las categorías
// @access  Public
router.get('/', getCategorias);

// @route   GET /api/categorias/:id
// @desc    Obtener una categoría por ID
// @access  Public
router.get('/:id', getCategoriaById);

// @route   POST /api/categorias
// @desc    Crear nueva categoría
// @access  Private/Admin
router.post('/', verifyToken, verifyAdmin, createCategoria);

// @route   PUT /api/categorias/:id
// @desc    Actualizar categoría
// @access  Private/Admin
router.put('/:id', verifyToken, verifyAdmin, updateCategoria);

// @route   DELETE /api/categorias/:id
// @desc    Eliminar categoría
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteCategoria);

export default router;
