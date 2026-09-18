export interface Telefonia {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export type EstadoPlan = 'DISPONIBLE' | 'NO_DISPONIBLE';

export interface PlanTelefonia {
  id: number;
  telefonia_id: number;
  telefonia_nombre?: string;
  nombre: string;
  costo: number;
  estado: EstadoPlan;
  descripcion?: string;
  total_lineas?: number;
  created_at?: string;
  updated_at?: string;
}

export type EstadoPersonal = 'ACTIVO' | 'INACTIVO';

export interface Personal {
  id: number;
  nombre: string;
  departamento: string;
  cargo: string;
  estado: EstadoPersonal;
  total_lineas?: number;
  costo_total_mensual?: number;
  created_at?: string;
  updated_at?: string;
}

export type EstadoLinea = 'ACTIVA' | 'BAJA' | 'DISPONIBLE' | 'SUSPENDIDA';

export interface Linea {
  id: number;
  numero: string;
  activo_id?: number | null;
  plan_id: number;
  personal_id?: number | null;
  estado: EstadoLinea;
  fecha_asignacion?: string;
  fecha_baja?: string | null;
  motivo_baja?: string | null;
  observaciones?: string;
  // Campos enriquecidos
  plan_nombre?: string;
  plan_costo?: number;
  plan_estado?: EstadoPlan;
  telefonia_id?: number;
  telefonia_nombre?: string;
  personal_nombre?: string;
  personal_departamento?: string;
  personal_cargo?: string;
  celular_codigo?: string;
  celular_nombre?: string;
  celular_modelo?: string;
  celular_marca?: string;
  celular_imei_1?: string;
  celular_imei_2?: string;
  celular_memoria?: string;
  celular_capacidad?: string;
  created_at?: string;
  updated_at?: string;
}

export type TipoEventoHistorial = 'ASIGNACION' | 'TRANSFERENCIA' | 'CAMBIO_PLAN' | 'CAMBIO_EQUIPO' | 'EDICION' | 'BAJA' | 'REACTIVACION';

export interface HistorialLinea {
  id: number;
  linea_id: number;
  personal_anterior_id?: number | null;
  personal_anterior_nombre?: string;
  personal_nuevo_id?: number | null;
  personal_nuevo_nombre?: string;
  plan_anterior_id?: number | null;
  plan_anterior_nombre?: string;
  plan_nuevo_id?: number | null;
  plan_nuevo_nombre?: string;
  activo_anterior_id?: number | null;
  activo_anterior_codigo?: string;
  activo_anterior_modelo?: string;
  activo_nuevo_id?: number | null;
  activo_nuevo_codigo?: string;
  activo_nuevo_modelo?: string;
  tipo_evento: TipoEventoHistorial;
  motivo?: string;
  usuario_id?: number | null;
  usuario_nombre?: string;
  fecha: string;
}

export interface HistorialMovimientoCelular {
  id: number;
  fecha_movimiento: string;
  responsable?: string;
  observaciones?: string;
  estado?: string;
  lugar_origen_nombre?: string;
  lugar_destino_nombre?: string;
}

export interface HistorialAsignacionCelular {
  id: number;
  linea_id: number;
  linea_numero: string;
  tipo_evento: string;
  fecha: string;
  motivo?: string;
  personal_nombre?: string;
  usuario_nombre?: string;
}

export interface CelularHistorialDetalle {
  id: number;
  codigo: string;
  nombre: string;
  serie?: string;
  estado_operativo: string;
  modelo: string;
  marca_nombre?: string;
  lugar_nombre?: string;
  proveedor_nombre?: string;
  procesador?: string;
  memoria?: string;
  capacidad_disco?: string;
  imei_1?: string;
  imei_2?: string;
  accesorios?: string;
  fecha_adquision?: string;
  costo_adquision?: number;
  movimientos?: HistorialMovimientoCelular[];
  asignaciones_lineas?: HistorialAsignacionCelular[];
}

export interface HistorialLineaResponse {
  eventos_linea: HistorialLinea[];
  celular?: CelularHistorialDetalle | null;
}

export interface LineasStats {
  total_lineas: number;
  lineas_activas: number;
  lineas_bajas: number;
  lineas_disponibles: number;
  costo_mensual_total: number;
  total_personal_con_lineas: number;
}

// Helpers
export const getColorEstadoLinea = (estado?: EstadoLinea | string | null): string => {
  switch (estado) {
    case 'ACTIVA':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    case 'DISPONIBLE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    case 'BAJA':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    case 'SUSPENDIDA':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
  }
};

export const getNombreEstadoLinea = (estado?: EstadoLinea | string | null): string => {
  switch (estado) {
    case 'ACTIVA':
      return 'Activa';
    case 'DISPONIBLE':
      return 'Disponible';
    case 'BAJA':
      return 'De Baja';
    case 'SUSPENDIDA':
      return 'Suspendida';
    default:
      return estado || 'N/A';
  }
};

export const getColorEstadoPlan = (estado?: EstadoPlan | string | null): string => {
  return estado === 'DISPONIBLE'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700';
};

export const getNombreEstadoPlan = (estado?: EstadoPlan | string | null): string => {
  return estado === 'DISPONIBLE' ? 'Disponible' : 'No Disponible';
};

// ==================== TIPOS Y HELPERS CELULARES ====================

export type EstadoOperativoCelular = 'DISPONIBLE' | 'ACTIVO' | 'BAJA' | 'DESHABILITADO';

export interface LineaAsignadaCelular {
  id: number;
  numero: string;
  estado: string;
  plan_nombre?: string;
  telefonia_nombre?: string;
  personal_id?: number;
  personal_nombre?: string;
  personal_cargo?: string;
  personal_departamento?: string;
}

export interface CelularLinea {
  // Activo base
  id: number;
  codigo: string;
  nombre: string;
  serie?: string;
  activo_estado: string;
  clasificacion?: string;
  imagen?: string;
  descripcion?: string;
  fecha_adquision?: string;
  costo_adquision?: number;
  lugar_id?: number;
  lugar_nombre?: string;
  marca_id?: number;
  marca_nombre?: string;
  proveedor_id?: number;
  proveedor_nombre?: string;

  // Celulares specific
  modelo: string;
  procesador?: string;
  memoria?: string;
  capacidad_disco?: string;
  imei_1?: string;
  imei_2?: string;
  estado_operativo: EstadoOperativoCelular;
  fecha_baja?: string;
  motivo_baja?: string;
  accesorios?: string;

  // Capacidad de SIMs / IMEIs
  max_lineas?: number;
  total_lineas_asignadas?: number;
  disponible_para_linea?: boolean;
  lineas_asignadas?: LineaAsignadaCelular[];

  // Línea enlazada (si existe y activa, para compatibilidad)
  linea_id?: number;
  linea_numero?: string;
  linea_estado?: string;
  plan_nombre?: string;
  plan_costo?: number;
  telefonia_nombre?: string;

  // Personal enlazado
  personal_id?: number;
  personal_nombre?: string;
  personal_cargo?: string;
  personal_departamento?: string;
}

export const getColorEstadoCelular = (estado?: EstadoOperativoCelular | string | null): string => {
  switch (estado) {
    case 'DISPONIBLE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    case 'ACTIVO':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    case 'BAJA':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    case 'DESHABILITADO':
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
  }
};

export const getNombreEstadoCelular = (estado?: EstadoOperativoCelular | string | null): string => {
  switch (estado) {
    case 'DISPONIBLE':
      return 'Disponible';
    case 'ACTIVO':
      return 'En Servicio (Activo)';
    case 'BAJA':
      return 'Dado de Baja';
    case 'DESHABILITADO':
      return 'Deshabilitado';
    default:
      return estado || 'N/A';
  }
};

// API Services
const API_URL = '/api/lineas';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const lineaService = {
  // LÍNEAS
  getAll: async (params?: { search?: string; telefonia_id?: number; estado?: string; personal_id?: number; plan_id?: number }): Promise<Linea[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.telefonia_id) query.append('telefonia_id', params.telefonia_id.toString());
    if (params?.estado) query.append('estado', params.estado);
    if (params?.personal_id) query.append('personal_id', params.personal_id.toString());
    if (params?.plan_id) query.append('plan_id', params.plan_id.toString());

    const res = await fetch(`${API_URL}?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener líneas');
    return data.data || [];
  },

  getById: async (id: number): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener línea');
    return data.data;
  },

  create: async (payload: {
    numero: string;
    activo_id?: number | null;
    plan_id: number;
    personal_id?: number | null;
    estado?: EstadoLinea;
    fecha_asignacion?: string;
    observaciones?: string;
  }): Promise<Linea> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al crear línea');
    return data.data;
  },

  update: async (
    id: number,
    payload: {
      numero?: string;
      activo_id?: number | null;
      plan_id?: number;
      personal_id?: number | null;
      estado?: EstadoLinea;
      fecha_asignacion?: string;
      observaciones?: string;
    }
  ): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al actualizar línea');
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al eliminar línea');
  },

  transferir: async (id: number, payload: { personal_nuevo_id: number; motivo?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/transferir`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al transferir línea');
    return data.data;
  },

  cambiarPlan: async (id: number, payload: { plan_nuevo_id: number; motivo?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/cambiar-plan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al cambiar plan');
    return data.data;
  },

  cambiarEquipo: async (id: number, payload: { activo_nuevo_id?: number | null; motivo?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/cambiar-equipo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al cambiar equipo');
    return data.data;
  },

  darDeBaja: async (id: number, payload: { motivo_baja: string; fecha_baja?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/dar-baja`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al dar de baja la línea');
    return data.data;
  },

  getHistorial: async (id: number): Promise<HistorialLineaResponse> => {
    const res = await fetch(`${API_URL}/${id}/historial`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener historial');
    if (data.data && data.data.eventos_linea) {
      return data.data;
    }
    return {
      eventos_linea: Array.isArray(data.data) ? data.data : [],
      celular: null,
    };
  },

  getStats: async (): Promise<LineasStats> => {
    const res = await fetch(`${API_URL}/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener estadísticas');
    return data.data;
  },

  // PLANES
  getPlanes: async (params?: { telefonia_id?: number; estado?: string }): Promise<PlanTelefonia[]> => {
    const query = new URLSearchParams();
    if (params?.telefonia_id) query.append('telefonia_id', params.telefonia_id.toString());
    if (params?.estado) query.append('estado', params.estado);
    const res = await fetch(`${API_URL}/planes?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener planes');
    return data.data || [];
  },

  createPlan: async (payload: { telefonia_id: number; nombre: string; costo: number; estado?: EstadoPlan; descripcion?: string }): Promise<PlanTelefonia> => {
    const res = await fetch(`${API_URL}/planes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al crear plan');
    return data.data;
  },

  updatePlan: async (id: number, payload: { telefonia_id?: number; nombre?: string; costo?: number; estado?: EstadoPlan; descripcion?: string }): Promise<PlanTelefonia> => {
    const res = await fetch(`${API_URL}/planes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al actualizar plan');
    return data.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/planes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al eliminar plan');
  },

  // PERSONAL
  getPersonal: async (): Promise<Personal[]> => {
    const res = await fetch(`${API_URL}/personal`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener personal');
    return data.data || [];
  },

  getPersonalById: async (id: number): Promise<{ personal: Personal; lineas: Linea[] }> => {
    const res = await fetch(`${API_URL}/personal/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener personal');
    return data.data;
  },

  createPersonal: async (payload: { nombre: string; departamento: string; cargo: string; estado?: EstadoPersonal }): Promise<Personal> => {
    const res = await fetch(`${API_URL}/personal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al registrar personal');
    return data.data;
  },

  updatePersonal: async (id: number, payload: { nombre?: string; departamento?: string; cargo?: string; estado?: EstadoPersonal }): Promise<Personal> => {
    const res = await fetch(`${API_URL}/personal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al actualizar personal');
    return data.data;
  },

  deletePersonal: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/personal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al eliminar personal');
  },

  // TELEFONIAS
  getTelefonias: async (): Promise<Telefonia[]> => {
    const res = await fetch(`${API_URL}/telefonias`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener telefonías');
    return data.data || [];
  },

  createTelefonia: async (payload: { nombre: string }): Promise<Telefonia> => {
    const res = await fetch(`${API_URL}/telefonias`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al crear telefonía');
    return data.data;
  },

  updateTelefonia: async (id: number, payload: { nombre: string }): Promise<Telefonia> => {
    const res = await fetch(`${API_URL}/telefonias/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al actualizar telefonía');
    return data.data;
  },

  deleteTelefonia: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/telefonias/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al eliminar telefonía');
  },

  // CELULARES
  getCelulares: async (params?: { search?: string; estado_operativo?: string; marca_id?: number; lugar_id?: number; telefonia_id?: number; disponibles_para_linea?: boolean }): Promise<CelularLinea[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.estado_operativo) query.append('estado_operativo', params.estado_operativo);
    if (params?.marca_id) query.append('marca_id', params.marca_id.toString());
    if (params?.lugar_id) query.append('lugar_id', params.lugar_id.toString());
    if (params?.telefonia_id) query.append('telefonia_id', params.telefonia_id.toString());
    if (params?.disponibles_para_linea) query.append('disponibles_para_linea', 'true');

    const res = await fetch(`${API_URL}/celulares?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener celulares');
    return data.data || [];
  },

  getCelularById: async (id: number): Promise<CelularLinea> => {
    const res = await fetch(`${API_URL}/celulares/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al obtener celular');
    return data.data;
  },

  updateCelularEstado: async (
    id: number,
    payload: { estado_operativo: EstadoOperativoCelular; accesorios?: string; motivo?: string }
  ): Promise<any> => {
    const res = await fetch(`${API_URL}/celulares/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al actualizar estado del celular');
    return data.data;
  },

  darDeBajaCelular: async (
    id: number,
    payload: { motivo_baja: string; fecha_baja?: string }
  ): Promise<any> => {
    const res = await fetch(`${API_URL}/celulares/${id}/dar-baja`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al dar de baja el celular');
    return data.data;
  },
};

