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

router.use(authenticateToken);

router.get('/', obtenerLugares);
router.get('/:id', obtenerLugarPorId);
router.post('/', crearLugar);
router.put('/:id', actualizarLugar);
router.delete('/:id', eliminarLugar);

export default router;
