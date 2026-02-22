import api from '@/lib/api';

export interface BitacoraEntry {
  id: number;
  accion: string;
  tabla_afectada: string;
  registro_id: number;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_usuario: string | null;
  fecha: string;
  usuario_nombre: string | null;
  usuario_email: string | null;
  usuario_rol: string | null;
}

export interface BitacoraResponse {
  total: number;
  registros: BitacoraEntry[];
}

export interface BitacoraStats {
  total: number;
  ultimas_24h: number;
  por_accion: { accion: string; total: string }[];
  por_tabla: { tabla_afectada: string; total: string }[];
}

export interface BackupInfo {
  config: {
    schedule: string;
    destino: string;
    formato: string;
    retencion: string;
  };
  base_de_datos: {
    nombre: string;
    tamaño_total: string;
    tablas: { table_name: string; size: string; columnas: string }[];
  };
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
}

export const superadminService = {
  getBitacora: async (params?: {
    tabla?: string;
    accion?: string;
    usuario_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<BitacoraResponse> => {
    const response = await api.get('/superadmin/bitacora', { params });
    return response.data;
  },

  getBitacoraStats: async (): Promise<BitacoraStats> => {
    const response = await api.get('/superadmin/bitacora/stats');
    return response.data;
  },

  getBitacoraTables: async (): Promise<string[]> => {
    const response = await api.get('/superadmin/bitacora/tablas');
    return response.data;
  },

  getBackupsInfo: async (): Promise<BackupInfo> => {
    const response = await api.get('/superadmin/backups/info');
    return response.data;
  },

  getUsuarios: async (): Promise<UsuarioAdmin[]> => {
    const response = await api.get('/superadmin/usuarios');
    return response.data;
  },
};
