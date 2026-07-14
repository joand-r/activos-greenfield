"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { movimientoService, Movimiento } from "@/services/movimiento.service";
import { useToast } from "@/contexts/ToastContext";

const ListaMovimientosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [modalDetalle, setModalDetalle] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);

  useEffect(() => {
    document.title = "Lista de Movimientos | Activos Greenfield";
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    showLoading();
    try {
      const data = await movimientoService.getAll();
      setMovimientos(data || []);
    } catch (error: any) {
      console.error("Error al cargar movimientos:", error);
      setError(error.message || "Error al cargar los movimientos");
      toast.error('Error al cargar', error.message || 'No se pudieron cargar los movimientos');
      setMovimientos([]);
    } finally {
      hideLoading();
    }
  };

  const verDetalle = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setModalDetalle(false);
    setMovimientoSeleccionado(null);
  };

  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'USADO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'DANADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DONADO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'VENDIDO':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'TRANSFERIR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatearEstado = (estado: string) => {
    const nombres: Record<string, string> = {
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

  const getLugarDestinoLabel = (mov: Movimiento) => {
    if (mov.lugar_destino_nombre) return mov.lugar_destino_nombre;
    switch (mov.estado) {
      case 'DANADO': return 'Fue Dañado';
      case 'DONADO': return 'Fue Donado';
      case 'VENDIDO': return 'Fue Vendido';
      case 'TRANSFERIR': return 'Transferido';
      default: return '—';
    }
  };

  const movimientosFiltrados = movimientos.filter((movimiento) =>
    movimiento.codigo_movimiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    movimiento.responsable?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        pageName="Lista de Movimientos"
        description="Historial de movimientos de activos"
      />

      <section className="pb-16 pt-4">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Movimientos Registrados ({movimientosFiltrados.length})
            </h2>
            <Link
              href="/admin/movimientos/registrar"
              className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10 flex items-center gap-2"
            >
              + Registrar Movimiento
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-body-color/70">
                Filtros
              </p>
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-color/50 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por código o responsable..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 pl-9 pr-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Total Movimientos
              </p>
              <p className="text-3xl font-bold text-primary">{movimientos.length}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Activo
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Origen
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Destino
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Responsable
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.map((movimiento, index) => (
                    <tr
                      key={movimiento.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-dark" : "bg-gray-100/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {movimiento.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {movimiento.codigo_movimiento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {movimiento.activo_nombre || movimiento.activo_codigo || `ID: ${movimiento.activo_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {movimiento.lugar_origen_nombre || `ID: ${movimiento.lugar_origen_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {getLugarDestinoLabel(movimiento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatearFecha(movimiento.fecha_movimiento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {movimiento.responsable}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(movimiento.estado)}`}>
                          {formatearEstado(movimiento.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => verDetalle(movimiento)}
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                            title="Ver detalle"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {movimientosFiltrados.length === 0 && (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                No se encontraron movimientos con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal de Detalle */}
      {modalDetalle && movimientoSeleccionado && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-gray-dark shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Detalle del Movimiento {movimientoSeleccionado.codigo_movimiento}
              </h3>
              <button
                onClick={cerrarModalDetalle}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ID:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{movimientoSeleccionado.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Código:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{movimientoSeleccionado.codigo_movimiento}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Activo:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {movimientoSeleccionado.activo_nombre || movimientoSeleccionado.activo_codigo || `ID: ${movimientoSeleccionado.activo_id}`}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Lugar Origen:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {movimientoSeleccionado.lugar_origen_nombre || `ID: ${movimientoSeleccionado.lugar_origen_id}`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Lugar Destino:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getLugarDestinoLabel(movimientoSeleccionado)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fecha:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatearFecha(movimientoSeleccionado.fecha_movimiento)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Responsable:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{movimientoSeleccionado.responsable}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado:</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(movimientoSeleccionado.estado)}`}>
                    {formatearEstado(movimientoSeleccionado.estado)}
                  </span>
                </div>
                
                {movimientoSeleccionado.observaciones && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Observaciones:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {movimientoSeleccionado.observaciones}
                    </p>
                  </div>
                )}

                {/* Bloque especial para transferencias */}
                {movimientoSeleccionado.estado === 'TRANSFERIR' && movimientoSeleccionado.nuevo_activo_id && (
                  <div className="pt-4 border-t-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-2">Transferencia registrada</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                      Activo original marcado como <strong>TRANSFERIR</strong>.
                      Se creó el nuevo activo <strong>{movimientoSeleccionado.nuevo_activo_codigo}</strong> ({movimientoSeleccionado.nuevo_activo_nombre}) en el lugar destino, heredando el estado original.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={cerrarModalDetalle}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaMovimientosPage;
