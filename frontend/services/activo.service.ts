import api from '../lib/api';

export type TipoActivo = 
  | 'EDIFICACION'
  | 'ELECTRODOMESTICO'
  | 'EQUIPO_CAMPO'
  | 'HERRAMIENTA'
  | 'MUEBLE_ENSER'
  | 'UTENSILIO_EQUIPAMIENTO'
  | 'EQUIPO_TECNOLOGICO'
  | 'VEHICULO'
  | 'MAQUINARIA'
  | 'TERRENO';

export type EstadoActivo = 
  | 'NUEVO'
  | 'USADO'
  | 'DISPONIBLE'
  | 'DANADO'
  | 'DONADO'
  | 'VENDIDO'
  | 'TRANSFERIR';

export type TipoConstancia = 
  | 'FACTURA'
  | 'PROFORMA'
  | 'RECIBO';

export interface Activo {
  id: number;
  nombre: string;
  tipo_activo: TipoActivo;
  codigo: string;
  serie?: string | null;
  imagen?: string | null;
  estado?: EstadoActivo | null;
  descripcion?: string | null;
  fecha_adquision?: string | null;
  costo_adquision?: number | null;
  tipo_constancia?: TipoConstancia | null;
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
  codigo?: string; // Opcional porque se genera automáticamente en el backend
  imagen?: string;
  estado?: EstadoActivo;
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

// Helper para obtener nombre legible del tipo de activo
export const getNombreTipoActivo = (tipo: TipoActivo): string => {
  const nombres: Record<TipoActivo, string> = {
    EDIFICACION: 'Edificación',
    ELECTRODOMESTICO: 'Electrodoméstico',
    EQUIPO_CAMPO: 'Equipo de Campo',
    HERRAMIENTA: 'Herramienta',
    MUEBLE_ENSER: 'Muebles y Enseres',
    UTENSILIO_EQUIPAMIENTO: 'Utensilio y Equipamiento',
    EQUIPO_TECNOLOGICO: 'Equipo Tecnológico',
    VEHICULO: 'Vehículo',
    MAQUINARIA: 'Maquinaria',
    TERRENO: 'Terreno',
  };
  return nombres[tipo] || tipo;
};

// Helper para determinar si un tipo de activo es simple o complejo
export const esActivoSimple = (tipo: TipoActivo): boolean => {
  const simples: TipoActivo[] = [
    'EDIFICACION',
    'ELECTRODOMESTICO',
    'EQUIPO_CAMPO',
    'HERRAMIENTA',
    'MUEBLE_ENSER',
    'UTENSILIO_EQUIPAMIENTO',
  ];
  return simples.includes(tipo);
};

// Helper para determinar si requiere marca y proveedor
export const requiereMarcaProveedor = (tipo: TipoActivo): boolean => {
  return tipo !== 'TERRENO';
};

// Helper para obtener nombre legible del estado
export const getNombreEstadoActivo = (estado: EstadoActivo): string => {
  const nombres: Record<EstadoActivo, string> = {
    NUEVO: 'Nuevo',
    USADO: 'Usado',
    DISPONIBLE: 'Disponible',
    DANADO: 'Dañado',
    DONADO: 'Donado',
    VENDIDO: 'Vendido',
    TRANSFERIR: 'Por Transferir',
  };
  return nombres[estado] || estado;
};

// Helper para obtener nombre legible del tipo de constancia
export const getNombreTipoConstancia = (tipo: TipoConstancia): string => {
  const nombres: Record<TipoConstancia, string> = {
    FACTURA: 'Factura',
    PROFORMA: 'Proforma',
    RECIBO: 'Recibo',
  };
  return nombres[tipo] || tipo;
};

export const activoService = {
  // Obtener todos los activos
  // vista: 'servicio' (default, excluye bajas) | 'bajas' | 'transferidos' | 'todos'
  getAll: async (params?: { tipo_activo?: TipoActivo; lugar_id?: number; vista?: 'servicio' | 'bajas' | 'transferidos' | 'todos' }): Promise<Activo[]> => {
    let endpoint = '/activos';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.tipo_activo) queryParams.append('tipo_activo', params.tipo_activo);
      if (params.lugar_id) queryParams.append('lugar_id', params.lugar_id.toString());
      if (params.vista) queryParams.append('vista', params.vista);
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    const response = await api.get(endpoint);
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

  // Obtener próximo código que se generaría para un lugar
  getProximoCodigo: async (lugar_id: number): Promise<string> => {
    const response = await api.get(`/activos/proximo-codigo/${lugar_id}`);
    return response.data.codigo;
  },
};
