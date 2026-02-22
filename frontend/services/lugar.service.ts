import api from '../lib/api';

export type TipoLugar = 'VIVIENDA' | 'OFICINA' | 'ALMACEN' | 'CENTER' | 'PROPIEDAD';

export interface Lugar {
  id: number;
  nombre: string;
  inicial: string;
  tipo: TipoLugar;
}

export const getNombreTipoLugar = (tipo: TipoLugar): string => {
  const nombres: Record<TipoLugar, string> = {
    VIVIENDA: 'Vivienda',
    OFICINA: 'Oficina',
    ALMACEN: 'Almacén',
    CENTER: 'Center',
    PROPIEDAD: 'Propiedad',
  };
  return nombres[tipo] || tipo;
};

export const lugarService = {
  getAll: async (tipo?: TipoLugar): Promise<Lugar[]> => {
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
