import { api } from '@/lib/api';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getById: (id: number) => api.get(`/categorias/${id}`),
  create: (data: any) => api.post('/categorias', data),
  update: (id: number, data: any) => api.put(`/categorias/${id}`, data),
  delete: (id: number) => api.delete(`/categorias/${id}`)
};
