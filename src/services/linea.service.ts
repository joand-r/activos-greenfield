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
  equipo_asignado?: string;
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
  created_at?: string;
  updated_at?: string;
}

export type TipoEventoHistorial = 'ASIGNACION' | 'TRANSFERENCIA' | 'CAMBIO_PLAN' | 'BAJA' | 'REACTIVACION';

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
  tipo_evento: TipoEventoHistorial;
  motivo?: string;
  usuario_id?: number | null;
  usuario_nombre?: string;
  fecha: string;
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

// API Services
const API_URL = '/api/lineas';

export const lineaService = {
  // LÍNEAS
  getAll: async (params?: { search?: string; telefonia_id?: number; estado?: string; personal_id?: number; plan_id?: number }): Promise<Linea[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.telefonia_id) query.append('telefonia_id', params.telefonia_id.toString());
    if (params?.estado) query.append('estado', params.estado);
    if (params?.personal_id) query.append('personal_id', params.personal_id.toString());
    if (params?.plan_id) query.append('plan_id', params.plan_id.toString());

    const res = await fetch(`${API_URL}?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener líneas');
    return data.data || [];
  },

  getById: async (id: number): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener línea');
    return data.data;
  },

  create: async (payload: {
    numero: string;
    equipo_asignado?: string;
    plan_id: number;
    personal_id?: number | null;
    estado?: EstadoLinea;
    fecha_asignacion?: string;
    observaciones?: string;
  }): Promise<Linea> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear línea');
    return data.data;
  },

  update: async (
    id: number,
    payload: {
      numero?: string;
      equipo_asignado?: string;
      plan_id?: number;
      personal_id?: number | null;
      estado?: EstadoLinea;
      fecha_asignacion?: string;
      observaciones?: string;
    }
  ): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar línea');
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar línea');
  },

  transferir: async (id: number, payload: { personal_nuevo_id: number; motivo?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/transferir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al transferir línea');
    return data.data;
  },

  cambiarPlan: async (id: number, payload: { plan_nuevo_id: number; motivo?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/cambiar-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al cambiar plan');
    return data.data;
  },

  darDeBaja: async (id: number, payload: { motivo_baja: string; fecha_baja?: string }): Promise<Linea> => {
    const res = await fetch(`${API_URL}/${id}/dar-baja`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al dar de baja la línea');
    return data.data;
  },

  getHistorial: async (id: number): Promise<HistorialLinea[]> => {
    const res = await fetch(`${API_URL}/${id}/historial`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener historial');
    return data.data || [];
  },

  getStats: async (): Promise<LineasStats> => {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  },

  // PLANES
  getPlanes: async (params?: { telefonia_id?: number; estado?: string }): Promise<PlanTelefonia[]> => {
    const query = new URLSearchParams();
    if (params?.telefonia_id) query.append('telefonia_id', params.telefonia_id.toString());
    if (params?.estado) query.append('estado', params.estado);
    const res = await fetch(`${API_URL}/planes?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener planes');
    return data.data || [];
  },

  createPlan: async (payload: { telefonia_id: number; nombre: string; costo: number; estado?: EstadoPlan; descripcion?: string }): Promise<PlanTelefonia> => {
    const res = await fetch(`${API_URL}/planes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear plan');
    return data.data;
  },

  updatePlan: async (id: number, payload: { telefonia_id?: number; nombre?: string; costo?: number; estado?: EstadoPlan; descripcion?: string }): Promise<PlanTelefonia> => {
    const res = await fetch(`${API_URL}/planes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar plan');
    return data.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/planes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar plan');
  },

  // PERSONAL
  getPersonal: async (): Promise<Personal[]> => {
    const res = await fetch(`${API_URL}/personal`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener personal');
    return data.data || [];
  },

  getPersonalById: async (id: number): Promise<{ personal: Personal; lineas: Linea[] }> => {
    const res = await fetch(`${API_URL}/personal/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener personal');
    return data.data;
  },

  createPersonal: async (payload: { nombre: string; departamento: string; cargo: string; estado?: EstadoPersonal }): Promise<Personal> => {
    const res = await fetch(`${API_URL}/personal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar personal');
    return data.data;
  },

  updatePersonal: async (id: number, payload: { nombre?: string; departamento?: string; cargo?: string; estado?: EstadoPersonal }): Promise<Personal> => {
    const res = await fetch(`${API_URL}/personal/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar personal');
    return data.data;
  },

  deletePersonal: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/personal/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar personal');
  },

  // TELEFONIAS
  getTelefonias: async (): Promise<Telefonia[]> => {
    const res = await fetch(`${API_URL}/telefonias`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener telefonías');
    return data.data || [];
  },

  createTelefonia: async (payload: { nombre: string }): Promise<Telefonia> => {
    const res = await fetch(`${API_URL}/telefonias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear telefonía');
    return data.data;
  },

  updateTelefonia: async (id: number, payload: { nombre: string }): Promise<Telefonia> => {
    const res = await fetch(`${API_URL}/telefonias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar telefonía');
    return data.data;
  },

  deleteTelefonia: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/telefonias/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar telefonía');
  },
};
