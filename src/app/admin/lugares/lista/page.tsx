"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { lugarService, Lugar, TipoLugar } from "@/services/lugar.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";

const ListaLugaresPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  
  // Modales
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(null);
  const [modalInfo, setModalInfo] = useState(false);

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    inicial: "",
    tipo: "" as TipoLugar | ""
  });

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    inicial: "",
    tipo: "" as TipoLugar | ""
  });

  const tiposLugar: {id: TipoLugar, nombre: string}[] = [
    { id: "VIVIENDA", nombre: "Vivienda" },
    { id: "OFICINA", nombre: "Oficina" },
    { id: "ALMACEN", nombre: "Almacén" },
    { id: "CENTER", nombre: "Center" },
    { id: "PROPIEDAD", nombre: "Propiedad" },
  ];

  useEffect(() => {
    document.title = "Lista de Lugares | Activos Greenfield";
    cargarLugares();
  }, []);

  const cargarLugares = async () => {
    showLoading();
    try {
      const data = await lugarService.getAll();
      setLugares(data || []);
    } catch (error: any) {
      console.error("Error al cargar lugares:", error);
      setError(error.message || "Error al cargar los lugares");
      setLugares([]);
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  // Controladores de Edición
  const abrirModalEdicion = (lugar: Lugar) => {
    setLugarSeleccionado(lugar);
    setDatosEdicion({
      nombre: lugar.nombre,
      inicial: lugar.inicial,
      tipo: lugar.tipo as TipoLugar
    });
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setLugarSeleccionado(null);
    setDatosEdicion({ nombre: "", inicial: "", tipo: "" });
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lugarSeleccionado) return;

    if (datosEdicion.inicial.length !== 3) {
      toast.error("Error", "Las iniciales deben tener exactamente 3 caracteres");
      return;
    }
    
    showLoading();
    try {
      await lugarService.update(lugarSeleccionado.id, {
        nombre: datosEdicion.nombre,
        inicial: datosEdicion.inicial.toUpperCase(),
        tipo: datosEdicion.tipo as TipoLugar
      });
      await cargarLugares();
      cerrarModalEdicion();
      hideLoading();
      toast.success("Actualización Exitosa", "Lugar actualizado correctamente");
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      hideLoading();
      toast.error("Error al actualizar", error.message || "No se pudo actualizar el lugar");
    }
  };

  // Controladores de Registro
  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "", inicial: "", tipo: "" });
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setDatosRegistro({ nombre: "", inicial: "", tipo: "" });
  };

  const registrarLugar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (datosRegistro.inicial.length !== 3) {
      toast.error("Error", "Las iniciales deben tener exactamente 3 caracteres");
      return;
    }

    if (!datosRegistro.tipo) {
      toast.error("Error", "El tipo de lugar es obligatorio");
      return;
    }

    showLoading();
    try {
      await lugarService.create({
        nombre: datosRegistro.nombre,
        inicial: datosRegistro.inicial.toUpperCase(),
        tipo: datosRegistro.tipo as TipoLugar
      });
      await cargarLugares();
      cerrarModalRegistro();
      hideLoading();
      toast.success("Registro Exitoso", "Lugar registrado correctamente");
    } catch (error: any) {
      console.error("Error al registrar lugar:", error);
      hideLoading();
      toast.error("Error al registrar", error.message || "No se pudo registrar el lugar");
    }
  };

  const lugaresFiltrados = (lugares || []).filter((lugar) => {
    const coincideTipo = filtroTipo === "" || lugar.tipo === filtroTipo;
    const coincideBusqueda =
      busqueda === "" ||
      lugar?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      lugar?.inicial?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  return (
    <>
      <Breadcrumb
        pageName="Lista de Lugares"
        description="Gestiona las ubicaciones y departamentos físicos"
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
                    placeholder="Buscar por nombre o iniciales..."
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 pl-9 pr-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-color/75">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>

                {/* Filtro Tipo */}
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-xs text-body-color dark:text-white outline-none focus:border-primary transition-all"
                >
                  <option value="">Todos los tipos</option>
                  {(tiposLugar || []).map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Registrar modal */}
              <button
                onClick={abrirModalRegistro}
                className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Lugar
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
                    <th className="px-6 py-4">Iniciales</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {lugaresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-body-color">
                        No se encontraron lugares
                      </td>
                    </tr>
                  ) : (
                    lugaresFiltrados.map((lugar) => (
                      <tr
                        key={lugar.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors text-xs"
                      >
                        <td className="px-6 py-4 text-body-color font-mono">{lugar.id}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-primary/10 px-2.5 py-1 font-mono font-bold text-[10px] text-primary">
                            {lugar.inicial}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-black dark:text-white">{lugar.nombre}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                              lugar.tipo === "VIVIENDA"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                : lugar.tipo === "OFICINA"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                : lugar.tipo === "ALMACEN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                : lugar.tipo === "CENTER"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                                : "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300"
                            }`}
                          >
                            {lugar.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEdicion(lugar)}
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
                Registrar Nuevo Lugar
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

            <form onSubmit={registrarLugar}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Lugar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Vivienda Santa Cruz"
                    value={datosRegistro.nombre}
                    onChange={(e) => setDatosRegistro({...datosRegistro, nombre: e.target.value})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Iniciales (3 caracteres en mayúsculas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    pattern="[a-zA-Z]{3}"
                    placeholder="VSP"
                    value={datosRegistro.inicial}
                    onChange={(e) => setDatosRegistro({...datosRegistro, inicial: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all font-mono font-bold"
                  />
                  <p className="mt-1.5 text-[10px] text-body-color">Se utilizarán para la codificación (Ej: VSP-001).</p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Lugar <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={datosRegistro.tipo}
                    onChange={(e) => setDatosRegistro({...datosRegistro, tipo: e.target.value as TipoLugar})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-body-color dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all"
                  >
                    <option value="">Seleccione un tipo</option>
                    {(tiposLugar || []).map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
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
      {modalEdicionAbierto && lugarSeleccionado && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-black/95 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 px-6 py-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Editar Lugar
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
                    Iniciales
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    pattern="[a-zA-Z]{3}"
                    value={datosEdicion.inicial}
                    onChange={(e) => setDatosEdicion({...datosEdicion, inicial: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    required
                    value={datosEdicion.tipo}
                    onChange={(e) => setDatosEdicion({...datosEdicion, tipo: e.target.value as TipoLugar})}
                    className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-body-color dark:text-white focus:border-primary focus:shadow-[0_0_12px_rgba(74,108,247,0.1)] outline-none transition-all"
                  >
                    {(tiposLugar || []).map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
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
        message="Los lugares registrados no pueden ser eliminados del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de datos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaLugaresPage;
