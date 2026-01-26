import express from 'express';
import {
  getArticulos,
  getArticuloById,
  getArticulosByLugar,
  getArticulosByCategoria,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  buscarArticulos,
  getNextCode
} from '../controllers/articulo.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/articulos/buscar
// @desc    Buscar artículos
// @access  Public
// NOTA: Esta ruta debe ir antes de /api/articulos/:id para evitar conflictos
router.get('/buscar', buscarArticulos);

// @route   GET /api/articulos/next-code/:lugarId
// @desc    Obtener el siguiente código disponible para un lugar
// @access  Public
router.get('/next-code/:lugarId', getNextCode);

// @route   GET /api/articulos/lugar/:lugarId
// @desc    Obtener artículos por lugar
// @access  Public
router.get('/lugar/:lugarId', getArticulosByLugar);

// @route   GET /api/articulos/categoria/:categoriaId
// @desc    Obtener artículos por categoría
// @access  Public
router.get('/categoria/:categoriaId', getArticulosByCategoria);

// @route   GET /api/articulos
// @desc    Obtener todos los artículos con filtros opcionales
// @access  Public
router.get('/', getArticulos);

// @route   GET /api/articulos/:id
// @desc    Obtener un artículo por ID con relaciones
// @access  Public
router.get('/:id', getArticuloById);

// @route   POST /api/articulos
// @desc    Crear nuevo artículo (código generado automáticamente)
// @access  Private/Admin
router.post('/', verifyToken, verifyAdmin, createArticulo);

// @route   PUT /api/articulos/:id
// @desc    Actualizar artículo
// @access  Private/Admin
router.put('/:id', verifyToken, verifyAdmin, updateArticulo);

// @route   DELETE /api/articulos/:id
// @desc    Eliminar artículo
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteArticulo);

export default router;
