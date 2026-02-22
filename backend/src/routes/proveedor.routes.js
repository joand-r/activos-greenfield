import express from 'express';
import { 
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../controllers/proveedor.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', obtenerProveedores);
router.get('/:id', obtenerProveedorPorId);
router.post('/', crearProveedor);
router.put('/:id', actualizarProveedor);
router.delete('/:id', eliminarProveedor);

export default router;
