import api from '../lib/api';

export interface Lugar {
  id: number;
  nombre: string;
  inicial: string;
  tipo?: string | null;
}

export const lugarService = {
  getAll: async (tipo?: string): Promise<Lugar[]> => {
    const params = tipo ? { tipo } : {};
    const response = await api.get('/lugares', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Lugar> => {
    const response = await api.get(`/lugares/${id}`);
    return response.data;
  },

  create: async (data: Omit<Lugar, 'id'>): Promise<Lugar> => {
    const response = await api.post('/lugares', data);
    return response.data;
  },

  update: async (id: number, data: Omit<Lugar, 'id'>): Promise<Lugar> => {
    const response = await api.put(`/lugares/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lugares/${id}`);
  },
};
