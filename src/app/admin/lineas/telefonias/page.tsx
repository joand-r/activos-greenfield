"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect, useMemo } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { lineaService, Telefonia } from "@/services/linea.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";

const ListaTelefoniasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  
  // Modales
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [telefoniaSeleccionada, setTelefoniaSeleccionada] = useState<Telefonia | null>(null);
  const [modalInfo, setModalInfo] = useState(false);

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({ nombre: "" });
  const [datosRegistro, setDatosRegistro] = useState({ nombre: "" });

  useEffect(() => {
    document.title = "Telefonías | Activos Greenfield";
    cargarTelefonias();
  }, []);

  const cargarTelefonias = async () => {
    showLoading();
    try {
      const data = await lineaService.getTelefonias();
      setTelefonias(data || []);
    } catch (error: any) {
      console.error("Error al cargar telefonías:", error);
      setError(error.message || "Error al cargar las telefonías");
      setTelefonias([]);
    } finally {
      hideLoading();
    }
  };

  const abrirModalEdicion = (telefonia: Telefonia) => {
    setTelefoniaSeleccionada(telefonia);
    setDatosEdicion({ nombre: telefonia.nombre });
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setTelefoniaSeleccionada(null);
    setDatosEdicion({ nombre: "" });
  };

  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "" });
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setDatosRegistro({ nombre: "" });
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosRegistro.nombre.trim()) {
      toast.error("Campo requerido", "El nombre es obligatorio");
      return;
    }

    showLoading();
    try {
      await lineaService.createTelefonia({ nombre: datosRegistro.nombre.trim() });
      toast.success("Telefonía registrada", "La empresa telefónica ha sido registrada exitosamente");
      cerrarModalRegistro();
      cargarTelefonias();
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar la telefonía");
    } finally {
      hideLoading();
    }
  };

  const handleEdicionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefoniaSeleccionada) return;
    if (!datosEdicion.nombre.trim()) {
      toast.error("Campo requerido", "El nombre es obligatorio");
      return;
    }

    showLoading();
    try {
      await lineaService.updateTelefonia(telefoniaSeleccionada.id, {
        nombre: datosEdicion.nombre.trim(),
      });
      toast.success("Telefonía actualizada", "Los cambios han sido guardados exitosamente");
      cerrarModalEdicion();
      cargarTelefonias();
    } catch (err: any) {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar la telefonía");
    } finally {
      hideLoading();
    }
  };

  const telefoniasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return telefonias || [];
    return (telefonias || []).filter((t) => t.nombre?.toLowerCase().includes(q));
  }, [telefonias, busqueda]);

  return (
    <>
      <Breadcrumb
        pageName="Telefonías"
        description="Gestión de empresas operadoras telefónicas (Tigo, Entel, Viva)"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Barra superior con Filtros y Botón */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar telefonía..."
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
              />
            </div>
            <button
              onClick={abrirModalRegistro}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Telefonía
            </button>
          </div>

          {/* Tabla de Telefonías */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Nombre Operadora
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {telefoniasFiltradas.length > 0 ? (
                    telefoniasFiltradas.map((telefonia) => (
                      <tr
                        key={telefonia.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                          #{telefonia.id}
                        </td>
                        <td className="px-6 py-4 font-bold text-black dark:text-white text-sm">
                          {telefonia.nombre}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => abrirModalEdicion(telefonia)}
                              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                              title="Editar"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron empresas de telefonía registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Registrar Nueva Telefonía
            </h3>
            <form onSubmit={handleRegistroSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Nombre de la Operadora <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosRegistro.nombre}
                  onChange={(e) => setDatosRegistro({ nombre: e.target.value })}
                  placeholder="Ej: Tigo, Entel, Viva"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalRegistro}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Guardar Telefonía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {modalEdicionAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Editar Telefonía
            </h3>
            <form onSubmit={handleEdicionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Nombre de la Operadora <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosEdicion.nombre}
                  onChange={(e) => setDatosEdicion({ nombre: e.target.value })}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalEdicion}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <InfoModal
        isOpen={modalInfo}
        onClose={() => setModalInfo(false)}
        title="Acción Restringida"
        message="Las empresas de telefonía forman parte de la configuración del sistema."
      />
    </>
  );
};

export default ListaTelefoniasPage;
