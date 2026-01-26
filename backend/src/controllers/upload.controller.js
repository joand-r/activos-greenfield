import { uploadImage } from '../config/cloudinary.js';

/**
 * Sube una imagen a Cloudinary
 * POST /api/upload/image
 */
export const uploadImageController = async (req, res) => {
  try {
    // La imagen viene en base64 desde el frontend
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    // Subir a Cloudinary
    const result = await uploadImage(image, folder);

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error en uploadImageController:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};

// Controlador de eliminación de imagen removido intencionalmente
