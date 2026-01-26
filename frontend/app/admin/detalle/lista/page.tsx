"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import InfoModal from "@/components/InfoModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { movimientoService, Movimiento } from "@/services/movimiento.service";

const ListaMovimientosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [modalInfo, setModalInfo] = useState(false);

  useEffect(() => {
    document.title = "Lista de Movimientos | Activos Greenfield";
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    showLoading();
    try {
      const data = await movimientoService.getAll();
      setMovimientos(data);
      setError("");
    } catch (error: any) {
      console.error("Error al cargar movimientos:", error);
      setError(error.message || "Error al cargar los movimientos");
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  const movimientosFiltrados = movimientos.filter((mov) => {
    const coincideEstado = filtroEstado === "" || mov.estado === filtroEstado;
    const coincideBusqueda =
      busqueda === "" ||
      mov.codigo_movimiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mov.articulo_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mov.articulo_codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mov.responsable?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  return (
    <>
      <Breadcrumb
        pageName="Lista de Movimientos"
        description="Gestiona y visualiza todos los movimientos de artículos"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Movimientos Registrados ({movimientosFiltrados.length})
            </h2>
            <Link
              href="/admin/detalle/registrar"
              className="rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
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
          <div className="mb-8 shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Filtros
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                  Buscar
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Artículo, código o responsable..."
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Total Movimientos
              </p>
              <p className="text-3xl font-bold text-primary">{movimientos.length}</p>
            </div>
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Completados
              </p>
              <p className="text-3xl font-bold text-green-600">
                {movimientos.filter((m) => m.estado === "Completado").length}
              </p>
            </div>
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Pendientes
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {movimientos.filter((m) => m.estado === "Pendiente").length}
              </p>
            </div>
          </div>

          {/* Tabla */}
          <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Código Movimiento
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Artículo Origen
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Lugar Origen → Destino
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Responsable
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.map((mov, index) => (
                    <tr
                      key={mov.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-dark" : "bg-gray-100/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {mov.codigo_movimiento}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          {mov.tipo || 'Transferencia'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        <div>{mov.articulo_codigo}</div>
                        <div className="text-xs text-gray-500">{mov.articulo_nombre}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>{mov.lugar_origen_nombre}</span>
                          <span>→</span>
                          <span className="font-medium">{mov.lugar_destino_nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(mov.fecha_movimiento).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {mov.responsable}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mov.estado === "Completado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {mov.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={intentarEliminar}
                          className="rounded-sm bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-red-600 dark:shadow-submit-dark"
                        >
                          Eliminar
                        </button>
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

      {/* Modal Informativo */}
      <InfoModal
        isOpen={modalInfo}
        onClose={() => setModalInfo(false)}
        title="Política de Auditoría"
        message="Por políticas de auditoría, los movimientos no pueden ser eliminados. Esta acción garantiza la trazabilidad completa del historial de transferencias de activos."
        icon="shield"
      />
    </>
  );
};

export default ListaMovimientosPage;
