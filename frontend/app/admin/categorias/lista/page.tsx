"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import InfoModal from "@/components/InfoModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { categoriaService, Categoria } from "@/services/categoria.service";

const ListaCategoriasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [datosEdicion, setDatosEdicion] = useState<any>({});

  useEffect(() => {
    document.title = "Lista de Categorías | Activos Greenfield";
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    showLoading();
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error: any) {
      console.error("Error al cargar categorías:", error);
      setError(error.message || "Error al cargar las categorías");
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  const abrirModalEdicion = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setDatosEdicion({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
    setDatosEdicion({});
  };

  const guardarCambios = async () => {
    if (!categoriaSeleccionada) return;
    
    showLoading();
    try {
      await categoriaService.update(categoriaSeleccionada.id, datosEdicion);
      await cargarCategorias();
      cerrarModal();
      hideLoading();
      toast.success('Cambios guardados', 'La categoría ha sido actualizada exitosamente');
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      hideLoading();
      toast.error('Error al actualizar', error.message || 'No se pudo actualizar la categoría');
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        pageName="Lista de Categorías"
        description="Gestiona las categorías del sistema"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Categorías Registradas ({categoriasFiltradas.length})
            </h2>
            <Link
              href="/admin/categorias/registrar"
              className="rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
            >
              + Registrar Categoría
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
            <div>
              <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                Buscar por nombre
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar categoría..."
                className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
              />
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8">
            <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
              <p className="text-sm text-body-color dark:text-body-color-dark">
                Total Categorías
              </p>
              <p className="text-3xl font-bold text-primary">{categorias.length}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map((categoria, index) => (
                    <tr
                      key={categoria.id}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-dark" : "bg-gray-100/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {categoria.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        {categoria.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {categoria.descripcion || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => abrirModalEdicion(categoria)}
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all shadow-sm hover:shadow-md"
                            title="Editar"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={intentarEliminar}
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                            title="Información sobre eliminación"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categoriasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron categorías
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Edición */}
      {modalAbierto && categoriaSeleccionada && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-dark shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Editar Categoría
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={datosEdicion.nombre || ''}
                  onChange={(e) => setDatosEdicion({...datosEdicion, nombre: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={datosEdicion.descripcion || ''}
                  onChange={(e) => setDatosEdicion({...datosEdicion, descripcion: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={cerrarModal}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo sobre Eliminación */}
      <InfoModal
        isOpen={modalInfo}
        title="Política de Auditoría"
        message="Las categorías registradas no pueden ser eliminadas del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de datos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaCategoriasPage;
