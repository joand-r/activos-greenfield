import { api } from '@/lib/api';

export interface Lugar {
  id: number;
  nombre: string;
  tipo: string;
  iniciales: string;
  createdAt?: string;
  updatedAt?: string;
}

export const lugarService = {
  getAll: () => api.get('/lugares'),
  getById: (id: number) => api.get(`/lugares/${id}`),
  getIniciales: (id: number) => api.get(`/lugares/${id}/iniciales`),
  create: (data: any) => api.post('/lugares', data),
  update: (id: number, data: any) => api.put(`/lugares/${id}`, data),
  delete: (id: number) => api.delete(`/lugares/${id}`)
};
