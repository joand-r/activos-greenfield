import express from 'express';
import { 
  obtenerActivos,
  obtenerActivoPorId,
  crearActivo,
  actualizarActivo,
  eliminarActivo,
  obtenerProximoCodigo
} from '../controllers/activo.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas (sin token) — solo lectura
router.get('/', obtenerActivos);
router.get('/proximo-codigo/:lugar_id', authenticateToken, obtenerProximoCodigo);
router.get('/:id', obtenerActivoPorId);

// Rutas protegidas — escritura
router.post('/', authenticateToken, crearActivo);
router.put('/:id', authenticateToken, actualizarActivo);
router.delete('/:id', authenticateToken, eliminarActivo);

export default router;
