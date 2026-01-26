import express from 'express';

const router = express.Router();

// Ejemplo de ruta
router.get('/example', (req, res) => {
  res.json({ message: 'Ruta de ejemplo' });
});

export default router;
