import express from 'express';
import {
  getMovimientos,
  getMovimientoById,
  getMovimientosByArticulo,
  createMovimiento,
  createTransferencia,
  updateMovimiento,
  completarMovimiento,
  deleteMovimiento
} from '../controllers/movimiento.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/movimientos/articulo/:articuloId
// @desc    Obtener historial de movimientos de un artículo
// @access  Private
router.get('/articulo/:articuloId', verifyToken, getMovimientosByArticulo);

// @route   GET /api/movimientos
// @desc    Obtener todos los movimientos con filtros opcionales
// @access  Private
router.get('/', verifyToken, getMovimientos);

// @route   GET /api/movimientos/:id
// @desc    Obtener un movimiento por ID
// @access  Private
router.get('/:id', verifyToken, getMovimientoById);

// @route   POST /api/movimientos/transferencia
// @desc    Crear transferencia (marca origen como transferido y crea nuevo artículo)
// @access  Private
router.post('/transferencia', verifyToken, createTransferencia);

// @route   POST /api/movimientos
// @desc    Crear nuevo movimiento
// @access  Private
router.post('/', verifyToken, createMovimiento);

// @route   PUT /api/movimientos/:id
// @desc    Actualizar movimiento
// @access  Private
router.put('/:id', verifyToken, updateMovimiento);

// @route   PATCH /api/movimientos/:id/completar
// @desc    Completar movimiento y actualizar ubicación del artículo
// @access  Private
router.patch('/:id/completar', verifyToken, completarMovimiento);

// @route   DELETE /api/movimientos/:id
// @desc    Eliminar movimiento (solo pendientes)
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteMovimiento);

export default router;
