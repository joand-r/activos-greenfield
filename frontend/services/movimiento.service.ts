import api from '../lib/api';

export interface Movimiento {
  id: number;
  codigo_movimiento: string;
  activo_id: number;
  lugar_origen_id: number;
  lugar_destino_id: number;
  fecha_movimiento: string;
  responsable: string;
  observaciones?: string | null;
  estado: string;
  // Datos relacionados (cuando se obtiene con JOIN)
  activo_nombre?: string;
  activo_codigo?: string;
  lugar_origen_nombre?: string;
  lugar_destino_nombre?: string;
}

export interface CrearMovimientoDTO {
  activo_id: number;
  lugar_origen_id: number;
  lugar_destino_id: number;
  fecha_movimiento?: string;
  responsable: string;
  observaciones?: string;
  estado?: string;
}

export const movimientoService = {
  // Obtener todos los movimientos
  getAll: async (activo_id?: number): Promise<Movimiento[]> => {
    const params = activo_id ? { activo_id } : {};
    const response = await api.get('/movimientos', { params });
    return response.data;
  },

  // Obtener movimiento por ID
  getById: async (id: number): Promise<Movimiento> => {
    const response = await api.get(`/movimientos/${id}`);
    return response.data;
  },

  // Crear movimiento
  create: async (data: CrearMovimientoDTO): Promise<Movimiento> => {
    const response = await api.post('/movimientos', data);
    return response.data;
  },

  // Actualizar movimiento
  update: async (id: number, data: Partial<CrearMovimientoDTO>): Promise<Movimiento> => {
    const response = await api.put(`/movimientos/${id}`, data);
    return response.data;
  },

  // Eliminar movimiento
  delete: async (id: number): Promise<void> => {
    await api.delete(`/movimientos/${id}`);
  },

  // Obtener historial de movimientos de un activo
  getByActivo: async (activo_id: number): Promise<Movimiento[]> => {
    return movimientoService.getAll(activo_id);
  },
};
