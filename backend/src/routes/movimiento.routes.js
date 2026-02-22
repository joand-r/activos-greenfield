import express from 'express';
import { 
  obtenerMovimientos,
  obtenerMovimientoPorId,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
} from '../controllers/movimiento.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.delete('/:id', eliminarMovimiento);

export default router;
