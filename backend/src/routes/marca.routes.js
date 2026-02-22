import express from 'express';
import { 
  obtenerMarcas,
  obtenerMarcaPorId,
  crearMarca,
  actualizarMarca,
  eliminarMarca
} from '../controllers/marca.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas públicas (lectura)
router.get('/', obtenerMarcas);
router.get('/:id', obtenerMarcaPorId);

// Rutas protegidas (escritura)
router.post('/', crearMarca);
router.put('/:id', actualizarMarca);
router.delete('/:id', eliminarMarca);

export default router;
