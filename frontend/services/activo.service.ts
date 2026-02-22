import api from '../lib/api';

export type TipoActivo = 'TECNOLOGICO' | 'MOTORIZADO' | 'MUEBLE' | 'TERRENO' | 'EDIFICACION' | 'HERRAMIENTA' | 'UTENSILIO';

export interface Activo {
  id: number;
  nombre: string;
  tipo_activo: TipoActivo;
  codigo: string;
  serie?: string | null;
  imagen?: string | null;
  estado?: string | null;
  descripcion?: string | null;
  fecha_adquision?: string | null;
  costo_adquision?: number | null;
  tipo_constancia?: string | null;
  nro_constancia?: string | null;
  lugar_id: number;
  marca_id?: number | null;
  proveedor_id?: number | null;
  // Datos relacionados (cuando se obtiene con JOIN)
  lugar_nombre?: string;
  lugar_inicial?: string;
  marca_nombre?: string;
  proveedor_nombre?: string;
  // Datos específicos por tipo
  datos_especificos?: EquipoTecnologico | Motorizado | Terreno | null;
}

export interface EquipoTecnologico {
  activo_id: number;
  modelo?: string | null;
  procesador?: string | null;
  memoria?: string | null;
  capacidad_disco?: string | null;
}

export interface Motorizado {
  activo_id: number;
  tipo_vehiculo?: string | null;
  motor?: string | null;
  chasis?: string | null;
  color?: string | null;
  anho_modelo?: number | null;
}

export interface Terreno {
  activo_id: number;
  folio?: string | null;
  nro_registro?: string | null;
  area?: number | null;
  ubicacion?: string | null;
}

export interface CrearActivoDTO {
  nombre: string;
  tipo_activo: TipoActivo;
  serie?: string;
  imagen?: string;
  estado?: string;
  descripcion?: string;
  fecha_adquision?: string;
  costo_adquision?: number;
  tipo_constancia?: string;
  nro_constancia?: string;
  lugar_id: number;
  marca_id?: number;
  proveedor_id?: number;
  datos_especificos?: Partial<EquipoTecnologico | Motorizado | Terreno>;
}

export const activoService = {
  // Obtener todos los activos
  getAll: async (params?: { tipo_activo?: TipoActivo; lugar_id?: number }): Promise<Activo[]> => {
    const response = await api.get('/activos', { params });
    return response.data;
  },

  // Obtener activo por ID (incluye datos específicos)
  getById: async (id: number): Promise<Activo> => {
    const response = await api.get(`/activos/${id}`);
    return response.data;
  },

  // Crear activo (transacción con tabla hija)
  create: async (data: CrearActivoDTO): Promise<Activo> => {
    const response = await api.post('/activos', data);
    return response.data;
  },

  // Actualizar activo
  update: async (id: number, data: Partial<CrearActivoDTO>): Promise<Activo> => {
    const response = await api.put(`/activos/${id}`, data);
    return response.data;
  },

  // Eliminar activo (cascade elimina datos específicos)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/activos/${id}`);
  },

  // Obtener por tipo específico
  getByTipo: async (tipo_activo: TipoActivo): Promise<Activo[]> => {
    return activoService.getAll({ tipo_activo });
  },

  // Obtener por lugar
  getByLugar: async (lugar_id: number): Promise<Activo[]> => {
    return activoService.getAll({ lugar_id });
  },
};
