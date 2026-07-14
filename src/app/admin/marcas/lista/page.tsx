"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { marcaService, Marca } from "@/services/marca.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";

const ListaMarcasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  
  // Modales
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [modalInfo, setModalInfo] = useState(false);

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    descripcion: ""
  });

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    descripcion: ""
  });

  useEffect(() => {
    document.title = "Lista de Marcas | Activos Greenfield";
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    showLoading();
    try {
      const data = await marcaService.getAll();
      setMarcas(data || []);
    } catch (error: any) {
      console.error("Error al cargar marcas:", error);
      setError(error.message || "Error al cargar las marcas");
      setMarcas([]);
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  // Controladores de Edición
  const abrirModalEdicion = (marca: Marca) => {
    setMarcaSeleccionada(marca);
    setDatosEdicion({
      nombre: marca.nombre,
      descripcion: marca.descripcion || ""
    });
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setMarcaSeleccionada(null);
    setDatosEdicion({ nombre: "", descripcion: "" });
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaSeleccionada) return;

    if (!datosEdicion.nombre.trim()) {
      toast.error("Error", "El nombre es obligatorio");
      return;
    }
    
    showLoading();
    try {
      await marcaService.update(marcaSeleccionada.id, datosEdicion);
      await cargarMarcas();
      cerrarModalEdicion();
      hideLoading();
      toast.success("Actualización Exitosa", "Marca actualizada correctamente");
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      hideLoading();
      toast.error("Error al actualizar", error.message || "No se pudo actualizar la marca");
    }
  };

  // Controladores de Registro
  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "", descripcion: "" });
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setDatosRegistro({ nombre: "", descripcion: "" });
  };

  const registrarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!datosRegistro.nombre.trim()) {
      toast.error("Error", "El nombre de la marca es obligatorio");
      return;
    }

    showLoading();
    try {
      await marcaService.create(datosRegistro);
      await cargarMarcas();
      cerrarModalRegistro();
      hideLoading();
      toast.success("Registro Exitoso", "Marca registrada correctamente");
    } catch (error: any) {
      console.error("Error al registrar marca:", error);
      hideLoading();
      toast.error("Error al registrar", error.message || "No se pudo registrar la marca");
    }
  };

  const marcasFiltradas = (marcas || []).filter((marca) =>
    marca?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        pageName="Lista de Marcas"
        description="Gestiona las marcas del sistema"
      />

      <section className="pb-16 pt-4">
        <div className="container">
          {/* Panel Superior de Filtros y Acción (Glassmorphism) */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Input Busqueda */}
                <div className="relative max-w-xs flex-1">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar marca por nombre..."
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 pl-9 pr-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-color/75">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Botón Registrar modal */}
              <button
                onClick={abrirModalRegistro}
                className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Marca
              </button>
            </div>
          </div>

          {/* Tabla de Resultados (Glassmorphism) */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-900/30 border-b border-black/5 dark:border-white/5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {marcasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-body-color">
                        No se encontraron marcas
                      </td>
                    </tr>
                  ) : (
                    marcasFiltradas.map((marca) => (
                      <tr
                        key={marca.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-955/20 transition-colors text-xs"
                      >
                        <td className="px-6 py-4 text-body-color font-mono">{marca.id}</td>
                        <td className="px-6 py-4 font-bold text-black dark:text-white">{marca.nombre}</td>
                        <td className="px-6 py-4 text-body-color">{marca.descripcion || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEdicion(marca)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={intentarEliminar}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all text-white shadow-sm hover:shadow-md"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* modal de registro */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-black/95 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 px-6 py-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Registrar Nueva Marca
              </h3>
              <button
                onClick={cerrarModalRegistro}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={registrarMarca}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Samsung"
                    value={datosRegistro.nombre}
                    onChange={(e) => setDatosRegistro({...datosRegistro, nombre: e.target.value})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe la marca..."
                    value={datosRegistro.descripcion}
                    onChange={(e) => setDatosRegistro({...datosRegistro, descripcion: e.target.value})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 border-t border-black/5 dark:border-white/5 px-6 py-4 text-xs">
                <button
                  type="button"
                  onClick={cerrarModalRegistro}
                  className="rounded-xl border border-stroke dark:border-gray-800 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {modalEdicionAbierto && marcaSeleccionada && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-black/95 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 px-6 py-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Editar Marca
              </h3>
              <button
                onClick={cerrarModalEdicion}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={guardarCambios}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={datosEdicion.nombre}
                    onChange={(e) => setDatosEdicion({...datosEdicion, nombre: e.target.value})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={datosEdicion.descripcion}
                    onChange={(e) => setDatosEdicion({...datosEdicion, descripcion: e.target.value})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 border-t border-black/5 dark:border-white/5 px-6 py-4 text-xs">
                <button
                  type="button"
                  onClick={cerrarModalEdicion}
                  className="rounded-xl border border-stroke dark:border-gray-800 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Informativo sobre Eliminación */}
      <InfoModal
        isOpen={modalInfo}
        title="Política de Auditoría"
        message="Las marcas registradas no pueden ser eliminadas del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de datos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaMarcasPage;
