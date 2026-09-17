"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { 
  activoService, 
  Activo, 
  TipoActivo, 
  ClasificacionActivo,
  EstadoActivo, 
  TipoConstancia, 
  getNombreTipoActivo, 
  getNombreEstadoActivo, 
  getNombreClasificacion,
  getColorClasificacion,
} from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { uploadService } from "@/services/upload.service";
import InfoModal from "@/components/ui/InfoModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalDetalleActivo } from "@/components/modals/activos/ModalDetalleActivo";
import { ModalEditarActivo, EditActivoFormData } from "@/components/modals/activos/ModalEditarActivo";

const ListaActivosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [activos, setActivos] = useState<Activo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoActivo | "">("");
  const [filtroClasificacion, setFiltroClasificacion] = useState<ClasificacionActivo | "">("");
  const [vista, setVista] = useState<'servicio' | 'bajas' | 'transferidos' | 'todos'>('servicio');
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
  const [modalInfo, setModalInfo] = useState(false);
  const [imagenFullscreen, setImagenFullscreen] = useState(false);

  // Edit mode states
  const [modoEditar, setModoEditar] = useState(false);
  const [cargandoEdit, setCargandoEdit] = useState(false);
  const [confirmCancelarEdit, setConfirmCancelarEdit] = useState(false);
  const [editLugares, setEditLugares] = useState<Lugar[]>([]);
  const [editMarcas, setEditMarcas] = useState<Marca[]>([]);
  const [editProveedores, setEditProveedores] = useState<Proveedor[]>([]);
  const [editFormData, setEditFormData] = useState<EditActivoFormData>({
    nombre: '', clasificacion: 'FIJO', imagen: '', estado: 'DISPONIBLE', descripcion: '',
    fecha_adquision: '', costo_adquision: '', tipo_constancia: '',
    nro_constancia: '', lugar_id: '', marca_id: '', proveedor_id: '',
  });
  const [editImagenPreview, setEditImagenPreview] = useState('');
  const [editSubiendoImagen, setEditSubiendoImagen] = useState(false);
  const [editCamposEquipoTec, setEditCamposEquipoTec] = useState({ modelo: '', procesador: '', memoria: '', capacidad_disco: '' });
  const [editCamposCelular, setEditCamposCelular] = useState({ modelo: '', procesador: '', memoria: '', capacidad_disco: '', imei_1: '', imei_2: '' });
  const [editCamposMotorizado, setEditCamposMotorizado] = useState({ tipo_vehiculo: '', motor: '', chasis: '', color: '', anho_modelo: '', placa: '' });
  const [editCamposTerreno, setEditCamposTerreno] = useState({ folio: '', nro_registro: '', area: '', ubicacion: '' });

  useEffect(() => {
    document.title = "Lista de Activos | Activos Greenfield";
    cargarActivos('servicio');
  }, []);

  const cargarActivos = async (v: 'servicio' | 'bajas' | 'transferidos' | 'todos' = 'servicio') => {
    showLoading();
    try {
      const data = await activoService.getAll({ vista: v });
      setActivos(data || []);
    } catch (error: any) {
      console.error("Error al cargar activos:", error);
      setError(error.message || "Error al cargar los activos");
      setActivos([]);
    } finally {
      hideLoading();
    }
  };

  const cambiarVista = (v: 'servicio' | 'bajas' | 'transferidos' | 'todos') => {
    setVista(v);
    setBusqueda("");
    setFiltroTipo("");
    cargarActivos(v);
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'NUEVO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'USADO': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'DISPONIBLE': return 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300';
      case 'DANADO': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DONADO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'VENDIDO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'TRANSFERIR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const verDetalle = async (activo: Activo) => {
    setActivoSeleccionado(activo);
    setModalAbierto(true);
    setModoEditar(false);
    try {
      const completo = await activoService.getById(activo.id);
      setActivoSeleccionado(completo);
    } catch {
      // si falla, queda con los datos parciales
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setActivoSeleccionado(null);
    setImagenFullscreen(false);
    setModoEditar(false);
  };

  const iniciarEdicion = async () => {
    if (!activoSeleccionado) return;
    setCargandoEdit(true);
    setModoEditar(true);
    try {
      const activo = await activoService.getById(activoSeleccionado.id);
      setEditFormData({
        nombre: activo.nombre || '',
        clasificacion: (activo.clasificacion || 'FIJO') as ClasificacionActivo,
        imagen: activo.imagen || '',
        estado: activo.estado || 'DISPONIBLE',
        descripcion: activo.descripcion || '',
        fecha_adquision: activo.fecha_adquision ? String(activo.fecha_adquision).split('T')[0] : '',
        costo_adquision: activo.costo_adquision?.toString() || '',
        tipo_constancia: activo.tipo_constancia || '',
        nro_constancia: activo.nro_constancia || '',
        lugar_id: activo.lugar_id?.toString() || '',
        marca_id: activo.marca_id?.toString() || '',
        proveedor_id: activo.proveedor_id?.toString() || '',
      });
      setEditImagenPreview(activo.imagen || '');
      if (activo.datos_especificos) {
        const d = activo.datos_especificos as any;
        if (activo.tipo_activo === 'EQUIPO_TECNOLOGICO') {
          setEditCamposEquipoTec({ modelo: d.modelo || '', procesador: d.procesador || '', memoria: d.memoria || '', capacidad_disco: d.capacidad_disco || '' });
        } else if (activo.tipo_activo === 'CELULAR') {
          setEditCamposCelular({
            modelo: d.modelo || '',
            procesador: d.procesador || '',
            memoria: d.memoria || '',
            capacidad_disco: d.capacidad_disco || '',
            imei_1: d.imei_1 || '',
            imei_2: d.imei_2 || '',
          });
        } else if (activo.tipo_activo === 'VEHICULO' || activo.tipo_activo === 'MAQUINARIA') {
          setEditCamposMotorizado({ tipo_vehiculo: d.tipo_vehiculo || '', motor: d.motor || '', chasis: d.chasis || '', color: d.color || '', anho_modelo: d.anho_modelo?.toString() || '', placa: d.placa || '' });
        } else if (activo.tipo_activo === 'TERRENO') {
          setEditCamposTerreno({ folio: d.folio || '', nro_registro: d.nro_registro || '', area: d.area?.toString() || '', ubicacion: d.ubicacion || '' });
        }
      }
      if (editLugares.length === 0) {
        const [lug, mar, prov] = await Promise.all([lugarService.getAll(), marcaService.getAll(), proveedorService.getAll()]);
        setEditLugares(lug || []);
        setEditMarcas(mar || []);
        setEditProveedores(prov || []);
      }
    } catch {
      toast.error('Error', 'No se pudo cargar el activo para editar');
      setModoEditar(false);
    } finally {
      setCargandoEdit(false);
    }
  };

  const handleEditImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Archivo inválido', 'Selecciona una imagen válida'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Archivo muy grande', 'La imagen no debe superar 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setEditImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
    setEditSubiendoImagen(true);
    try {
      const { compressImage } = await import('@/lib/image');
      const base64 = await compressImage(file);
      const result = await uploadService.uploadImage(base64, 'activos-greenfield/activos');
      setEditFormData(prev => ({ ...prev, imagen: result.url }));
      toast.success('Imagen subida', 'La imagen se ha subido correctamente');
    } catch (err: any) {
      toast.error('Error al subir', err.message || 'No se pudo subir la imagen');
      setEditImagenPreview('');
    } finally { setEditSubiendoImagen(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activoSeleccionado) return;
    showLoading();
    try {
      const tipo = activoSeleccionado.tipo_activo;
      let datos_especificos: any = null;
      if (tipo === 'EQUIPO_TECNOLOGICO') {
        datos_especificos = { modelo: editCamposEquipoTec.modelo || null, procesador: editCamposEquipoTec.procesador || null, memoria: editCamposEquipoTec.memoria || null, capacidad_disco: editCamposEquipoTec.capacidad_disco || null };
      } else if (tipo === 'CELULAR') {
        datos_especificos = {
          modelo: editCamposCelular.modelo || null,
          procesador: editCamposCelular.procesador || null,
          memoria: editCamposCelular.memoria || null,
          capacidad_disco: editCamposCelular.capacidad_disco || null,
          imei_1: editCamposCelular.imei_1 || null,
          imei_2: editCamposCelular.imei_2 || null,
        };
      } else if (tipo === 'VEHICULO' || tipo === 'MAQUINARIA') {
        datos_especificos = { tipo_vehiculo: editCamposMotorizado.tipo_vehiculo || null, motor: editCamposMotorizado.motor || null, chasis: editCamposMotorizado.chasis || null, color: editCamposMotorizado.color || null, anho_modelo: editCamposMotorizado.anho_modelo ? parseInt(editCamposMotorizado.anho_modelo) : null, placa: editCamposMotorizado.placa || null };
      } else if (tipo === 'TERRENO') {
        datos_especificos = { folio: editCamposTerreno.folio || null, nro_registro: editCamposTerreno.nro_registro || null, area: editCamposTerreno.area ? parseFloat(editCamposTerreno.area) : null, ubicacion: editCamposTerreno.ubicacion || null };
      }
      await activoService.update(activoSeleccionado.id, {
        nombre: editFormData.nombre,
        clasificacion: editFormData.clasificacion,
        imagen: editFormData.imagen || undefined,
        estado: (editFormData.estado as EstadoActivo) || undefined,
        descripcion: editFormData.descripcion || undefined,
        fecha_adquision: editFormData.fecha_adquision || undefined,
        costo_adquision: editFormData.costo_adquision ? parseFloat(editFormData.costo_adquision) : undefined,
        tipo_constancia: (editFormData.tipo_constancia as TipoConstancia) || undefined,
        nro_constancia: editFormData.nro_constancia || undefined,
        lugar_id: parseInt(editFormData.lugar_id),
        marca_id: editFormData.marca_id ? parseInt(editFormData.marca_id) : undefined,
        proveedor_id: editFormData.proveedor_id ? parseInt(editFormData.proveedor_id) : undefined,
        datos_especificos,
      });
      hideLoading();
      toast.success('Activo actualizado', 'El activo ha sido actualizado exitosamente');
      setModoEditar(false);
      const actualizado = await activoService.getById(activoSeleccionado.id);
      setActivoSeleccionado(actualizado);
      cargarActivos(vista);
    } catch (err: any) {
      hideLoading();
      toast.error('Error al actualizar', err.message || 'No se pudo actualizar el activo');
    }
  };

  const tiposActivos: TipoActivo[] = [
    'EDIFICACION',
    'ELECTRODOMESTICO',
    'EQUIPO_CAMPO',
    'HERRAMIENTA',
    'MUEBLES_OFICINA',
    'MUEBLES_HOGAR',
    'UTENSILIO_EQUIPAMIENTO',
    'EQUIPO_TECNOLOGICO',
    'CELULAR',
    'VEHICULO',
    'MAQUINARIA',
    'TERRENO',
  ];

  const activosFiltrados = (activos || []).filter((activo) => {
    const cumpleBusqueda =
      activo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleTipo = filtroTipo === "" || activo.tipo_activo === filtroTipo;
    const cumpleClasificacion = filtroClasificacion === "" || activo.clasificacion === filtroClasificacion;
    return cumpleBusqueda && cumpleTipo && cumpleClasificacion;
  });

  return (
    <>
      <Breadcrumb pageName="Lista de Activos" description="Gestiona el inventario de activos de la empresa" />

      <section className="pb-12 text-xs">
        <div className="container mx-auto">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Selector de Vistas / Pestañas */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => cambiarVista('servicio')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  vista === 'servicio'
                    ? 'bg-primary text-white shadow-primary/25'
                    : 'border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md text-body-color dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                En Servicio
              </button>
              <button
                onClick={() => cambiarVista('bajas')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  vista === 'bajas'
                    ? 'bg-primary text-white shadow-primary/25'
                    : 'border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md text-body-color dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                De Baja
              </button>
              <button
                onClick={() => cambiarVista('transferidos')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  vista === 'transferidos'
                    ? 'bg-primary text-white shadow-primary/25'
                    : 'border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md text-body-color dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Transferidos
              </button>
              <button
                onClick={() => cambiarVista('todos')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                  vista === 'todos'
                    ? 'bg-primary text-white shadow-primary/25'
                    : 'border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md text-body-color dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Todos
              </button>
            </div>

            <Link
              href="/admin/activos/registrar"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Activo
            </Link>
          </div>

          {/* Filtros */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-body-color dark:text-gray-400">
              Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Buscar por nombre o código
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar activo..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por tipo de activo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as TipoActivo | "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los tipos</option>
                  {tiposActivos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {getNombreTipoActivo(tipo)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por clasificación
                </label>
                <select
                  value={filtroClasificacion}
                  onChange={(e) => setFiltroClasificacion(e.target.value as ClasificacionActivo | "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todas las clasificaciones</option>
                  <option value="FIJO">Activo Fijo</option>
                  <option value="MENOR">Activo Menor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Total Activos
              </p>
              <p className="text-2xl font-bold text-primary">{(activos || []).length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Filtrados
              </p>
              <p className="text-2xl font-bold text-secondary-foreground">{activosFiltrados.length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Tipos Diferentes
              </p>
              <p className="text-2xl font-bold text-green-600">{new Set((activos || []).map(a => a.tipo_activo)).size}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Clasificación
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Lugar
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {activosFiltrados.map((activo) => (
                    <tr
                      key={activo.id}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {activo.codigo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-black dark:text-white">
                        {activo.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-xl bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                          {getNombreTipoActivo(activo.tipo_activo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-bold border ${getColorClasificacion(activo.clasificacion)}`}>
                          {getNombreClasificacion(activo.clasificacion)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activo.estado ? (
                          <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-bold ${getColorEstado(activo.estado)}`}>
                            {getNombreEstadoActivo(activo.estado)}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {activo.lugar_nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => verDetalle(activo)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                            title="Ver Detalle"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {!['TRANSFERIR','VENDIDO','DONADO','DANADO'].includes(activo.estado || '') && (
                            <Link
                              href={`/admin/activos/editar/${activo.id}`}
                              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                              title="Editar"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          )}
                          <button
                            onClick={intentarEliminar}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activosFiltrados.length === 0 && (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                No se encontraron activos con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Imagen Fullscreen */}
      {imagenFullscreen && activoSeleccionado?.imagen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 cursor-zoom-out"
          onClick={() => setImagenFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all cursor-pointer"
            onClick={() => setImagenFullscreen(false)}
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activoSeleccionado.imagen}
            alt={activoSeleccionado.nombre}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      {!modoEditar && (
        <ModalDetalleActivo
          isOpen={modalAbierto}
          onClose={cerrarModal}
          activo={activoSeleccionado}
          onEditar={iniciarEdicion}
          onVerImagenFullscreen={() => setImagenFullscreen(true)}
        />
      )}

      {/* Modal de Edición */}
      {modoEditar && (
        <ModalEditarActivo
          isOpen={modalAbierto}
          activo={activoSeleccionado}
          cargando={cargandoEdit}
          formData={editFormData}
          setFormData={setEditFormData}
          lugares={editLugares}
          marcas={editMarcas}
          proveedores={editProveedores}
          imagenPreview={editImagenPreview}
          setImagenPreview={setEditImagenPreview}
          subiendoImagen={editSubiendoImagen}
          onImagenChange={handleEditImagenChange}
          camposEquipoTec={editCamposEquipoTec}
          setCamposEquipoTec={setEditCamposEquipoTec}
          camposCelular={editCamposCelular}
          setCamposCelular={setEditCamposCelular}
          camposMotorizado={editCamposMotorizado}
          setCamposMotorizado={setEditCamposMotorizado}
          camposTerreno={editCamposTerreno}
          setCamposTerreno={setEditCamposTerreno}
          onSubmit={handleEditSubmit}
          onClose={() => setConfirmCancelarEdit(true)}
        />
      )}

      {/* Confirm cancelar edición */}
      <ConfirmModal
        isOpen={confirmCancelarEdit}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas cancelar la edición? Se perderán todos los cambios realizados."
        confirmText="Sí, descartar"
        cancelText="Seguir editando"
        confirmVariant="warning"
        onConfirm={() => { setConfirmCancelarEdit(false); setModoEditar(false); }}
        onCancel={() => setConfirmCancelarEdit(false)}
      />

      {/* Modal Informativo sobre Eliminación */}
      <InfoModal
        isOpen={modalInfo}
        title="Política de Auditoría"
        message="Los activos registrados no pueden ser eliminados del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de datos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaActivosPage;
