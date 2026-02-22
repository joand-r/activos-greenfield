import express from 'express';
import { 
  obtenerActivos,
  obtenerActivoPorId,
  crearActivo,
  actualizarActivo,
  eliminarActivo
} from '../controllers/activo.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', obtenerActivos);
router.get('/:id', obtenerActivoPorId);
router.post('/', crearActivo);
router.put('/:id', actualizarActivo);
router.delete('/:id', eliminarActivo);

export default router;
