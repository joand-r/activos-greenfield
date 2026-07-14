import api from '../lib/api';

export interface Marca {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export const marcaService = {
  // Obtener todas las marcas
  getAll: async (): Promise<Marca[]> => {
    const response = await api.get('/marcas');
    return response.data;
  },

  // Obtener marca por ID
  getById: async (id: number): Promise<Marca> => {
    const response = await api.get(`/marcas/${id}`);
    return response.data;
  },

  // Crear marca
  create: async (data: Omit<Marca, 'id'>): Promise<Marca> => {
    const response = await api.post('/marcas', data);
    return response.data;
  },

  // Actualizar marca
  update: async (id: number, data: Omit<Marca, 'id'>): Promise<Marca> => {
    const response = await api.put(`/marcas/${id}`, data);
    return response.data;
  },

  // Eliminar marca
  delete: async (id: number): Promise<void> => {
    await api.delete(`/marcas/${id}`);
  },
};
