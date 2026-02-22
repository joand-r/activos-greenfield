"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { activoService, Activo, TipoActivo, EstadoActivo, TipoConstancia, getNombreTipoActivo, getNombreEstadoActivo, getNombreTipoConstancia, esActivoSimple, requiereMarcaProveedor } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { uploadService } from "@/services/upload.service";
import InfoModal from "@/components/InfoModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";

const ListaActivosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [activos, setActivos] = useState<Activo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoActivo | "">("");
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
  const [editFormData, setEditFormData] = useState({
    nombre: '', imagen: '', estado: 'DISPONIBLE', descripcion: '',
    fecha_adquision: '', costo_adquision: '', tipo_constancia: '',
    nro_constancia: '', lugar_id: '', marca_id: '', proveedor_id: '',
  });
  const [editImagenPreview, setEditImagenPreview] = useState('');
  const [editSubiendoImagen, setEditSubiendoImagen] = useState(false);
  const [editCamposEquipoTec, setEditCamposEquipoTec] = useState({ modelo: '', procesador: '', memoria: '', capacidad_disco: '' });
  const [editCamposMotorizado, setEditCamposMotorizado] = useState({ tipo_vehiculo: '', motor: '', chasis: '', color: '', anho_modelo: '' });
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
      case 'DISPONIBLE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'DANADO': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DONADO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'VENDIDO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'TRANSFERIR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const verDetalle = (activo: Activo) => {
    setActivoSeleccionado(activo);
    setModalAbierto(true);
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
        imagen: activo.imagen || '',
        estado: activo.estado || 'DISPONIBLE',
        descripcion: activo.descripcion || '',
        fecha_adquision: activo.fecha_adquision ? activo.fecha_adquision.split('T')[0] : '',
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
        } else if (activo.tipo_activo === 'VEHICULO' || activo.tipo_activo === 'MAQUINARIA') {
          setEditCamposMotorizado({ tipo_vehiculo: d.tipo_vehiculo || '', motor: d.motor || '', chasis: d.chasis || '', color: d.color || '', anho_modelo: d.anho_modelo?.toString() || '' });
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
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
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader(); r.readAsDataURL(file);
        r.onload = () => resolve(r.result as string); r.onerror = reject;
      });
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
      } else if (tipo === 'VEHICULO' || tipo === 'MAQUINARIA') {
        datos_especificos = { tipo_vehiculo: editCamposMotorizado.tipo_vehiculo || null, motor: editCamposMotorizado.motor || null, chasis: editCamposMotorizado.chasis || null, color: editCamposMotorizado.color || null, anho_modelo: editCamposMotorizado.anho_modelo ? parseInt(editCamposMotorizado.anho_modelo) : null };
      } else if (tipo === 'TERRENO') {
        datos_especificos = { folio: editCamposTerreno.folio || null, nro_registro: editCamposTerreno.nro_registro || null, area: editCamposTerreno.area ? parseFloat(editCamposTerreno.area) : null, ubicacion: editCamposTerreno.ubicacion || null };
      }
      await activoService.update(activoSeleccionado.id, {
        nombre: editFormData.nombre,
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

  const etiquetasDatosEspecificos: Record<string, string> = {
    modelo: 'Modelo',
    procesador: 'Procesador',
    memoria: 'Memoria RAM',
    capacidad_disco: 'Capacidad de Disco',
    tipo_vehiculo: 'Tipo de Vehículo',
    motor: 'Motor',
    chasis: 'Chasis',
    color: 'Color',
    anho_modelo: 'Año / Modelo',
    folio: 'Folio',
    nro_registro: 'Nro. Registro',
    area: 'Área (m²)',
    ubicacion: 'Ubicación',
  };

  const activosFiltrados = (activos || []).filter((activo) => {
    const cumpleBusqueda = 
      activo.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.codigo?.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleTipo = !filtroTipo || activo.tipo_activo === filtroTipo;
    
    return cumpleBusqueda && cumpleTipo;
  });

  const tiposActivos: TipoActivo[] = [
    'EDIFICACION',
    'ELECTRODOMESTICO',
    'EQUIPO_CAMPO',
    'HERRAMIENTA',
    'MUEBLE_ENSER',
    'UTENSILIO_EQUIPAMIENTO',
    'EQUIPO_TECNOLOGICO',
    'VEHICULO',
    'MAQUINARIA',
    'TERRENO',
  ];

  return (
    <>
      <Breadcrumb
        pageName="Lista de Activos"
        description="Gestiona todos los tipos de activos del sistema"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Activos Registrados ({activosFiltrados.length})
            </h2>
            <Link
              href="/admin/activos/registrar"
              className="rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
            >
              + Registrar Activo
            </Link>
          </div>

          {/* Tabs de Vista */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => cambiarVista('servicio')}
              className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${
                vista === 'servicio'
                  ? 'bg-primary text-white shadow-submit'
                  : 'bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 hover:border-primary'
              }`}
            >
              En Servicio
            </button>
            <button
              onClick={() => cambiarVista('transferidos')}
              className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${
                vista === 'transferidos'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 hover:border-yellow-400'
              }`}
            >
              Transferidos
            </button>
            <button
              onClick={() => cambiarVista('bajas')}
              className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${
                vista === 'bajas'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 hover:border-red-400'
              }`}
            >
              Dados de Baja
            </button>
            <button
              onClick={() => cambiarVista('todos')}
              className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${
                vista === 'todos'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 text-body-color dark:text-gray-300 hover:border-gray-400'
              }`}
            >
              Todos
            </button>
          </div>

          {vista === 'transferidos' && (
            <div className="mb-6 rounded-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Activos Transferidos</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                  Estos activos fueron transferidos a otro lugar y se crearon con un nuevo código en el destino. El código original queda aquí como registro histórico. Solo lectura.
                </p>
              </div>
            </div>
          )}

          {vista === 'bajas' && (
            <div className="mb-6 rounded-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-400">
                <strong>Activos dados de baja:</strong> Vendidos, donados o reportados como dañados. Solo consulta.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-8 shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                  Buscar por nombre o código
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar activo..."
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                  Filtrar por tipo de activo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as TipoActivo | "")}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                >
                  <option value="">Todos los tipos</option>
                  {tiposActivos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {getNombreTipoActivo(tipo)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Total Activos
              </p>
              <p className="text-3xl font-bold text-primary">{(activos || []).length}</p>
            </div>
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Filtrados
              </p>
              <p className="text-3xl font-bold text-secondary-foreground">{activosFiltrados.length}</p>
            </div>
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Tipos Diferentes
              </p>
              <p className="text-3xl font-bold text-green-600">{new Set((activos || []).map(a => a.tipo_activo)).size}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Lugar
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activosFiltrados.map((activo, index) => (
                    <tr
                      key={activo.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-dark" : "bg-gray-100/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                        {activo.codigo}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {activo.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {getNombreTipoActivo(activo.tipo_activo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {activo.estado ? (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getColorEstado(activo.estado)}`}>
                            {getNombreEstadoActivo(activo.estado)}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {activo.lugar_nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => verDetalle(activo)}
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                            title="Ver Detalle"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {!['TRANSFERIR','VENDIDO','DONADO','DANADO'].includes(activo.estado || '') && (
                            <Link
                              href={`/admin/activos/editar/${activo.id}`}
                              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition-all shadow-sm hover:shadow-md"
                              title="Editar"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          )}
                          <button
                            onClick={intentarEliminar}
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
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
      {modalAbierto && activoSeleccionado && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-dark shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 bg-white dark:bg-gray-dark z-10">
              <div className="flex items-center gap-3">
                {modoEditar && (
                  <button
                    onClick={() => setConfirmCancelarEdit(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Volver al detalle"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {modoEditar ? 'Editar Activo' : 'Detalle del Activo'}
                </h3>
              </div>
              <button
                onClick={modoEditar ? () => setConfirmCancelarEdit(true) : cerrarModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading edit */}
            {cargandoEdit && (
              <div className="flex items-center justify-center py-16">
                <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {/* EDIT FORM */}
            {modoEditar && !cargandoEdit && (
              <form onSubmit={handleEditSubmit}>
                <div className="px-6 py-5 space-y-4">

                  {/* Sección Lugar y Estado - destacada */}
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Ubicación y Estado</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Lugar <span className="text-red-500">*</span></label>
                        <select name="lugar_id" value={editFormData.lugar_id} onChange={handleEditChange} required
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary">
                          <option value="">-- Seleccione --</option>
                          {editLugares.map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.inicial})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Estado</label>
                        <select name="estado" value={editFormData.estado} onChange={handleEditChange}
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary">
                          <option value="NUEVO">Nuevo</option>
                          <option value="USADO">Usado</option>
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="DANADO">Dañado</option>
                          <option value="DONADO">Donado</option>
                          <option value="VENDIDO">Vendido</option>
                          <option value="TRANSFERIR">Por Transferir</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sección Información Básica */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Información Básica</h4>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Nombre <span className="text-red-500">*</span></label>
                      <input type="text" name="nombre" value={editFormData.nombre} onChange={handleEditChange} required placeholder="Nombre del activo"
                        className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                    </div>
                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Descripción</label>
                      <textarea name="descripcion" rows={2} value={editFormData.descripcion} onChange={handleEditChange} placeholder="Descripción..."
                        className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                    </div>
                  </div>

                  {/* Sección Adquisición */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Adquisición</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Fecha de Adquisición</label>
                        <input type="date" name="fecha_adquision" value={editFormData.fecha_adquision} onChange={handleEditChange}
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Costo (Bs.)</label>
                        <input type="number" step="0.01" name="costo_adquision" value={editFormData.costo_adquision} onChange={handleEditChange} placeholder="0.00"
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                      </div>
                      {activoSeleccionado && requiereMarcaProveedor(activoSeleccionado.tipo_activo) && (
                        <>
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Marca</label>
                            <select name="marca_id" value={editFormData.marca_id} onChange={handleEditChange}
                              className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary">
                              <option value="">-- Sin marca --</option>
                              {editMarcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Proveedor</label>
                            <select name="proveedor_id" value={editFormData.proveedor_id} onChange={handleEditChange}
                              className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary">
                              <option value="">-- Sin proveedor --</option>
                              {editProveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Tipo de Constancia</label>
                        <select name="tipo_constancia" value={editFormData.tipo_constancia} onChange={handleEditChange}
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary">
                          <option value="">Seleccionar...</option>
                          <option value="FACTURA">Factura</option>
                          <option value="PROFORMA">Proforma</option>
                          <option value="RECIBO">Recibo</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Nro. Constancia</label>
                        <input type="text" name="nro_constancia" value={editFormData.nro_constancia} onChange={handleEditChange} placeholder="Ej: 001-001234"
                          className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Sección Imagen */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Imagen</h4>
                    {!editImagenPreview ? (
                      <label htmlFor="edit-imagen-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                        <div className="flex flex-col items-center justify-center py-4">
                          {editSubiendoImagen ? (
                            <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          ) : (
                            <><svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><p className="text-xs text-gray-500">Click para subir imagen (PNG, JPG, max 5MB)</p></>
                          )}
                        </div>
                        <input id="edit-imagen-upload" type="file" accept="image/*" onChange={handleEditImagenChange} disabled={editSubiendoImagen} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editImagenPreview} alt="preview" className="w-full h-40 object-contain rounded-lg border dark:border-gray-600" />
                        <button type="button" onClick={() => { setEditImagenPreview(''); setEditFormData(p => ({ ...p, imagen: '' })); }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Datos Específicos */}
                  {activoSeleccionado && !esActivoSimple(activoSeleccionado.tipo_activo) && (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">Datos Técnicos - {getNombreTipoActivo(activoSeleccionado.tipo_activo)}</h4>
                      {activoSeleccionado.tipo_activo === 'EQUIPO_TECNOLOGICO' && (
                        <div className="grid grid-cols-2 gap-3">
                          {(['modelo', 'procesador', 'memoria', 'capacidad_disco'] as const).map(k => (
                            <div key={k}>
                              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">{k.replace('_', ' ')}</label>
                              <input type="text" value={editCamposEquipoTec[k]} onChange={e => setEditCamposEquipoTec(p => ({ ...p, [k]: e.target.value }))}
                                className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                            </div>
                          ))}
                        </div>
                      )}
                      {(activoSeleccionado.tipo_activo === 'VEHICULO' || activoSeleccionado.tipo_activo === 'MAQUINARIA') && (
                        <div className="grid grid-cols-2 gap-3">
                          {(['tipo_vehiculo', 'motor', 'chasis', 'color', 'anho_modelo'] as const).map(k => (
                            <div key={k}>
                              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">{k.replace(/_/g, ' ')}</label>
                              <input type={k === 'anho_modelo' ? 'number' : 'text'} value={editCamposMotorizado[k]} onChange={e => setEditCamposMotorizado(p => ({ ...p, [k]: e.target.value }))}
                                className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                            </div>
                          ))}
                        </div>
                      )}
                      {activoSeleccionado.tipo_activo === 'TERRENO' && (
                        <div className="grid grid-cols-2 gap-3">
                          {(['folio', 'nro_registro', 'area'] as const).map(k => (
                            <div key={k}>
                              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">{k.replace('_', ' ')}</label>
                              <input type={k === 'area' ? 'number' : 'text'} value={editCamposTerreno[k]} onChange={e => setEditCamposTerreno(p => ({ ...p, [k]: e.target.value }))}
                                className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                            </div>
                          ))}
                          <div className="col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Ubicación</label>
                            <textarea rows={2} value={editCamposTerreno.ubicacion} onChange={e => setEditCamposTerreno(p => ({ ...p, ubicacion: e.target.value }))}
                              className="border-stroke dark:text-white w-full rounded-sm border bg-white px-3 py-2 text-sm text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer edit */}
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 sticky bottom-0 bg-white dark:bg-gray-dark">
                  <p className="text-xs text-gray-400 dark:text-gray-500">ID: #{activoSeleccionado?.id}</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setConfirmCancelarEdit(true)}
                      className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      Cancelar
                    </button>
                    <button type="submit"
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-all">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* DETAIL VIEW */}
            {!modoEditar && !cargandoEdit && (
              <>
            <div className="px-6 py-5 space-y-5">

              {/* Imagen */}
              {activoSeleccionado.imagen && (
                <div className="flex justify-center">
                  <div
                    className="relative group cursor-zoom-in w-full max-h-64 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    onClick={() => setImagenFullscreen(true)}
                    title="Clic para ver en pantalla completa"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activoSeleccionado.imagen}
                      alt={activoSeleccionado.nombre}
                      className="w-full max-h-64 object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Ver pantalla completa
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN DESTACADA: Lugar y Estado */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Ubicación y Estado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Lugar</p>
                    <p className="text-base font-bold text-black dark:text-white flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {activoSeleccionado.lugar_nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                    {activoSeleccionado.estado ? (
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getColorEstado(activoSeleccionado.estado)}`}>
                        {getNombreEstadoActivo(activoSeleccionado.estado)}
                      </span>
                    ) : (
                      <p className="text-base font-bold text-gray-500">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Identificación */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Identificación</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Código</p>
                    <p className="text-sm font-mono font-bold text-black dark:text-white mt-0.5">{activoSeleccionado.codigo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.nombre}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipo de Activo</p>
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                      {getNombreTipoActivo(activoSeleccionado.tipo_activo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Adquisición */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Adquisición</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Fecha de Adquisición</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">
                      {activoSeleccionado.fecha_adquision
                        ? new Date(activoSeleccionado.fecha_adquision).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Costo</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">
                      {activoSeleccionado.costo_adquision ? `Bs. ${parseFloat(String(activoSeleccionado.costo_adquision)).toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipo de Constancia</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">
                      {activoSeleccionado.tipo_constancia ? getNombreTipoConstancia(activoSeleccionado.tipo_constancia) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nro. Constancia</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.nro_constancia || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Marca</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.marca_nombre || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Proveedor</p>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5">{activoSeleccionado.proveedor_nombre || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Descripción */}
              {activoSeleccionado.descripcion && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Descripción</h4>
                  <p className="text-sm text-black dark:text-white leading-relaxed">{activoSeleccionado.descripcion}</p>
                </div>
              )}

              {/* SECCIÓN: Datos Específicos */}
              {activoSeleccionado.datos_especificos && (
                (() => {
                  const entradas = Object.entries(activoSeleccionado.datos_especificos).filter(
                    ([key, value]) => key !== 'activo_id' && value !== null && value !== undefined && value !== ''
                  );
                  if (entradas.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">Datos Técnicos</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {entradas.map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {etiquetasDatosEspecificos[key] || key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-medium text-black dark:text-white mt-0.5">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}

            </div>

            {/* Footer detail */}
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 sticky bottom-0 bg-white dark:bg-gray-dark">
              <p className="text-xs text-gray-400 dark:text-gray-500">ID: #{activoSeleccionado.id}</p>
              <div className="flex gap-3">
                {!['TRANSFERIR','VENDIDO','DONADO','DANADO'].includes(activoSeleccionado.estado || '') && (
                  <button
                    onClick={iniciarEdicion}
                    className="rounded-lg bg-yellow-500 hover:bg-yellow-600 px-5 py-2 text-sm font-semibold text-white transition-all"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={cerrarModal}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
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
