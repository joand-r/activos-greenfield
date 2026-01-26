import { api } from '@/lib/api';

export interface Movimiento {
  id: number;
  codigo_movimiento: string;
  tipo: string;
  articulo_id: number;
  articulo_destino_id?: number;
  articulo_codigo?: string;
  articulo_nombre?: string;
  lugar_origen_id: number;
  lugar_origen_nombre?: string;
  lugar_destino_id: number;
  lugar_destino_nombre?: string;
  fecha_movimiento: string;
  responsable: string;
  motivo: string;
  observaciones?: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransferenciaRequest {
  articuloId: number;
  lugarDestinoId: number;
  responsable: string;
  motivo: string;
  observaciones?: string;
  fechaMovimiento?: string;
}

export interface TransferenciaResponse {
  success: boolean;
  message: string;
  data: {
    movimiento: Movimiento;
    articuloOriginal: {
      id: number;
      codigo: string;
      estado: string;
      activo: boolean;
      lugar: string;
    };
    articuloNuevo: {
      id: number;
      codigo: string;
      nombre: string;
      estado: string;
      activo: boolean;
      lugar: string;
    };
  };
}

interface MovimientoFilters {
  articuloId?: number;
  tipo?: string;
  estado?: string;
}

export const movimientoService = {
  /**
   * Obtener todos los movimientos con filtros opcionales
   */
  getAll: async (params?: MovimientoFilters): Promise<Movimiento[]> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return api.get(`/movimientos${query ? `?${query}` : ''}`);
  },

  /**
   * Obtener un movimiento por ID
   */
  getById: async (id: number): Promise<Movimiento> => {
    return api.get(`/movimientos/${id}`);
  },

  /**
   * Obtener historial de movimientos de un artículo
   */
  getByArticulo: async (articuloId: number): Promise<Movimiento[]> => {
    return api.get(`/movimientos/articulo/${articuloId}`);
  },

  /**
   * Crear una transferencia (marca origen como transferido y crea nuevo artículo)
   */
  crearTransferencia: async (data: TransferenciaRequest): Promise<TransferenciaResponse> => {
    return api.post('/movimientos/transferencia', data);
  },

  /**
   * Crear movimiento genérico
   */
  create: async (data: any): Promise<Movimiento> => {
    return api.post('/movimientos', data);
  },

  /**
   * Actualizar movimiento
   */
  update: async (id: number, data: any): Promise<Movimiento> => {
    return api.put(`/movimientos/${id}`, data);
  },

  /**
   * Completar movimiento
   */
  completar: async (id: number, fechaCompletado?: string): Promise<any> => {
    return api.post(`/movimientos/${id}/completar`, { fechaCompletado });
  },

  /**
   * Eliminar movimiento
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/movimientos/${id}`);
  }
};
