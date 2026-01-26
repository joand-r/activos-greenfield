import { api } from '@/lib/api';

interface ArticuloFilters {
  categoria?: number;
  lugar?: number;
  estado?: string;
  search?: string;
  incluirInactivos?: string;
}

export interface Articulo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaAdquisicion: string;
  fecha_adquisicion?: string;
  serie?: string;
  cantidad: number;
  precioUnitario: number;
  precio_unitario?: number;
  estado: string;
  activo?: boolean;
  articulo_origen_id?: number;
  categoria?: string;
  categoriaId?: number;
  categoria_id?: number;
  categoria_nombre?: string;
  lugar?: string;
  lugarId?: number;
  lugar_id?: number;
  lugar_nombre?: string;
  marca?: string;
  marcaId?: number;
  marca_id?: number;
  marca_nombre?: string;
  proveedor?: string;
  proveedorId?: number;
  proveedor_id?: number;
  proveedor_nombre?: string;
  constancia?: string;
  numeroConstancia?: string;
  numero_constancia?: string;
  imagen?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export const articuloService = {
  getAll: async (params?: ArticuloFilters): Promise<Articulo[]> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    const data = await api.get(`/articulos${query ? `?${query}` : ''}`);
    // Normalizar nombres provenientes del backend (_nombre -> campo sencillo)
    return (data || []).map((a: any) => ({
      ...a,
      categoria: a.categoria || a.categoria_nombre || a.categoriaNombre,
      lugar: a.lugar || a.lugar_nombre || a.lugarNombre,
      marca: a.marca || a.marca_nombre || a.marcaNombre,
      proveedor: a.proveedor || a.proveedor_nombre || a.proveedorNombre,
      constancia: a.constancia,
      numeroConstancia: a.numeroConstancia || a.numero_constancia,
    }));
  },
  getById: async (id: number): Promise<Articulo> => {
    const a = await api.get(`/articulos/${id}`);
    return {
      ...a,
      categoria: a.categoria || a.categoria_nombre || a.categoriaNombre,
      lugar: a.lugar || a.lugar_nombre || a.lugarNombre,
      marca: a.marca || a.marca_nombre || a.marcaNombre,
      proveedor: a.proveedor || a.proveedor_nombre || a.proveedorNombre,
      constancia: a.constancia,
      numeroConstancia: a.numeroConstancia || a.numero_constancia,
    };
  },
  getByLugar: async (lugarId: number): Promise<Articulo[]> => {
    const data = await api.get(`/articulos/lugar/${lugarId}`);
    return (data || []).map((a: any) => ({
      ...a,
      categoria: a.categoria || a.categoria_nombre || a.categoriaNombre,
      lugar: a.lugar || a.lugar_nombre || a.lugarNombre,
      marca: a.marca || a.marca_nombre || a.marcaNombre,
      proveedor: a.proveedor || a.proveedor_nombre || a.proveedorNombre,
      constancia: a.constancia,
      numeroConstancia: a.numeroConstancia || a.numero_constancia,
    }));
  },
  getByCategoria: async (categoriaId: number): Promise<Articulo[]> => {
    const data = await api.get(`/articulos/categoria/${categoriaId}`);
    return (data || []).map((a: any) => ({
      ...a,
      categoria: a.categoria || a.categoria_nombre || a.categoriaNombre,
      lugar: a.lugar || a.lugar_nombre || a.lugarNombre,
      marca: a.marca || a.marca_nombre || a.marcaNombre,
      proveedor: a.proveedor || a.proveedor_nombre || a.proveedorNombre,
      constancia: a.constancia,
      numeroConstancia: a.numeroConstancia || a.numero_constancia,
    }));
  },
  buscar: async (q: string): Promise<Articulo[]> => {
    const data = await api.get(`/articulos/buscar?q=${encodeURIComponent(q)}`);
    return (data || []).map((a: any) => ({
      ...a,
      categoria: a.categoria || a.categoria_nombre || a.categoriaNombre,
      lugar: a.lugar || a.lugar_nombre || a.lugarNombre,
      marca: a.marca || a.marca_nombre || a.marcaNombre,
      proveedor: a.proveedor || a.proveedor_nombre || a.proveedorNombre,
      constancia: a.constancia,
      numeroConstancia: a.numeroConstancia || a.numero_constancia,
    }));
  },
  create: (data: any) => api.post('/articulos', data),
  update: (id: number, data: any) => api.put(`/articulos/${id}`, data),
  delete: (id: number) => api.delete(`/articulos/${id}`)
};
