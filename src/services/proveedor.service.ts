import api from '../lib/api';

export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
}

export const proveedorService = {
  getAll: async (): Promise<Proveedor[]> => {
    const response = await api.get('/proveedores');
    return response.data;
  },

  getById: async (id: number): Promise<Proveedor> => {
    const response = await api.get(`/proveedores/${id}`);
    return response.data;
  },

  create: async (data: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    const response = await api.post('/proveedores', data);
    return response.data;
  },

  update: async (id: number, data: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    const response = await api.put(`/proveedores/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/proveedores/${id}`);
  },
};
