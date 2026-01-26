import express from 'express';
import {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from '../controllers/proveedor.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/proveedores
// @desc    Obtener todos los proveedores
// @access  Public
router.get('/', getProveedores);

// @route   GET /api/proveedores/:id
// @desc    Obtener un proveedor por ID
// @access  Public
router.get('/:id', getProveedorById);

// @route   POST /api/proveedores
// @desc    Crear nuevo proveedor
// @access  Private/Admin
router.post('/', verifyToken, verifyAdmin, createProveedor);

// @route   PUT /api/proveedores/:id
// @desc    Actualizar proveedor
// @access  Private/Admin
router.put('/:id', verifyToken, verifyAdmin, updateProveedor);

// @route   DELETE /api/proveedores/:id
// @desc    Eliminar proveedor
// @access  Private/Admin
router.delete('/:id', verifyToken, verifyAdmin, deleteProveedor);

export default router;
