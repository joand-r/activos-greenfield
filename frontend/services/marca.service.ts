import { api } from '@/lib/api';

export interface Marca {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const marcaService = {
  getAll: () => api.get('/marcas'),
  getById: (id: number) => api.get(`/marcas/${id}`),
  create: (data: any) => api.post('/marcas', data),
  update: (id: number, data: any) => api.put(`/marcas/${id}`, data),
  delete: (id: number) => api.delete(`/marcas/${id}`)
};
