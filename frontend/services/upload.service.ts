import { api } from '@/lib/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  };
}

export const uploadService = {
  /**
   * Sube una imagen a Cloudinary
   * @param imageBase64 - Imagen en formato base64
   * @param folder - Carpeta en Cloudinary (opcional)
   * @returns URL de la imagen subida
   */
  async uploadImage(imageBase64: string, folder?: string): Promise<UploadResponse['data']> {
    try {
      const payload = {
        image: imageBase64,
        folder: folder || 'activos-greenfield/articulos',
      };
      const result: UploadResponse = await api.post('/upload/image', payload);
      return result.data;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }
};
