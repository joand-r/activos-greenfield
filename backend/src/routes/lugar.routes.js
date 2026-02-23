import express from 'express';
import { 
  obtenerLugares,
  obtenerLugarPorId,
  crearLugar,
  actualizarLugar,
  eliminarLugar
} from '../controllers/lugar.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas (sin token) — solo lectura
router.get('/', obtenerLugares);
router.get('/:id', obtenerLugarPorId);

// Rutas protegidas — escritura
router.post('/', authenticateToken, crearLugar);
router.put('/:id', authenticateToken, actualizarLugar);
router.delete('/:id', authenticateToken, eliminarLugar);

export default router;
