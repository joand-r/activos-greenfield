import { api } from '@/lib/api';

export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const proveedorService = {
  getAll: () => api.get('/proveedores'),
  getById: (id: number) => api.get(`/proveedores/${id}`),
  create: (data: any) => api.post('/proveedores', data),
  update: (id: number, data: any) => api.put(`/proveedores/${id}`, data),
  delete: (id: number) => api.delete(`/proveedores/${id}`)
};
