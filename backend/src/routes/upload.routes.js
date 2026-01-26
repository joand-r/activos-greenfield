import { Router } from 'express';
import { uploadImageController } from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/upload/image - Subir imagen (temporal sin auth para testing)
router.post('/image', uploadImageController);

// Endpoint de eliminación de imagen removido intencionalmente

export default router;
