"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect, useMemo } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import {
  lineaService,
  Personal,
  Linea,
  EstadoPersonal,
  getColorEstadoLinea,
  getNombreEstadoLinea,
} from "@/services/linea.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalCrearEditarPersonal } from "@/components/modals";

const PersonalPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [error, setError] = useState("");

  // Modales
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalLineasAbierto, setModalLineasAbierto] = useState(false);
  const [personalSeleccionado, setPersonalSeleccionado] = useState<Personal | null>(null);
  const [lineasDelPersonal, setLineasDelPersonal] = useState<Linea[]>([]);
  const [cargandoLineas, setCargandoLineas] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);

  // Formularios
  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    departamento: "",
    cargo: "",
    estado: "ACTIVO" as EstadoPersonal,
  });

  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    departamento: "",
    cargo: "",
    estado: "ACTIVO" as EstadoPersonal,
  });

  useEffect(() => {
    document.title = "Personal y Asignaciones | Activos Greenfield";
    cargarPersonal();
  }, []);

  const cargarPersonal = async () => {
    showLoading();
    try {
      const data = await lineaService.getPersonal();
      setPersonalList(data || []);
    } catch (err: any) {
      console.error("Error al cargar personal:", err);
      setError(err.message || "Error al cargar la lista de personal");
    } finally {
      hideLoading();
    }
  };

  const abrirModalRegistro = () => {
    setDatosRegistro({
      nombre: "",
      departamento: "",
      cargo: "",
      estado: "ACTIVO",
    });
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
  };

  const abrirModalEdicion = (p: Personal) => {
    setPersonalSeleccionado(p);
    setDatosEdicion({
      nombre: p.nombre,
      departamento: p.departamento,
      cargo: p.cargo,
      estado: p.estado,
    });
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setPersonalSeleccionado(null);
  };

  const verLineasDePersonal = async (p: Personal) => {
    setPersonalSeleccionado(p);
    setModalLineasAbierto(true);
    setCargandoLineas(true);
    try {
      const res = await lineaService.getPersonalById(p.id);
      setLineasDelPersonal(res.lineas || []);
    } catch (err: any) {
      toast.error("Error al cargar líneas", err.message || "No se pudieron obtener las líneas del personal");
      setLineasDelPersonal([]);
    } finally {
      setCargandoLineas(false);
    }
  };

  const cerrarModalLineas = () => {
    setModalLineasAbierto(false);
    setPersonalSeleccionado(null);
    setLineasDelPersonal([]);
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosRegistro.nombre.trim() || !datosRegistro.departamento.trim() || !datosRegistro.cargo.trim()) {
      toast.error("Campos requeridos", "Por favor completa el nombre, departamento y cargo");
      return;
    }

    showLoading();
    try {
      await lineaService.createPersonal({
        nombre: datosRegistro.nombre.trim(),
        departamento: datosRegistro.departamento.trim(),
        cargo: datosRegistro.cargo.trim(),
        estado: datosRegistro.estado,
      });
      toast.success("Personal registrado", "El colaborador ha sido registrado exitosamente");
      cerrarModalRegistro();
      cargarPersonal();
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar el personal");
    } finally {
      hideLoading();
    }
  };

  const handleEdicionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalSeleccionado) return;
    if (!datosEdicion.nombre.trim() || !datosEdicion.departamento.trim() || !datosEdicion.cargo.trim()) {
      toast.error("Campos requeridos", "Por favor completa todos los campos obligatorios");
      return;
    }

    showLoading();
    try {
      await lineaService.updatePersonal(personalSeleccionado.id, {
        nombre: datosEdicion.nombre.trim(),
        departamento: datosEdicion.departamento.trim(),
        cargo: datosEdicion.cargo.trim(),
        estado: datosEdicion.estado,
      });
      toast.success("Personal actualizado", "Los datos han sido actualizados exitosamente");
      cerrarModalEdicion();
      cargarPersonal();
    } catch (err: any) {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar el personal");
    } finally {
      hideLoading();
    }
  };

  const departamentosUnicos = useMemo(() => {
    return Array.from(new Set((personalList || []).map((p) => p.departamento))).filter(Boolean);
  }, [personalList]);

  const personalFiltrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (personalList || []).filter((p) => {
      const cumpleBusqueda =
        !q ||
        p.nombre?.toLowerCase().includes(q) ||
        p.cargo?.toLowerCase().includes(q) ||
        p.departamento?.toLowerCase().includes(q);
      const cumpleDepartamento = !filtroDepartamento || p.departamento === filtroDepartamento;
      return cumpleBusqueda && cumpleDepartamento;
    });
  }, [personalList, busqueda, filtroDepartamento]);

  const totalConLineas = useMemo(() => {
    return (personalList || []).filter((p) => Number(p.total_lineas) > 0).length;
  }, [personalList]);

  return (
    <>
      <Breadcrumb
        pageName="Personal y Asignaciones"
        description="Gestión de colaboradores, asignación de líneas corporativas y control de costos por persona"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Estadísticas de Personal */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Total Personal
              </p>
              <p className="text-2xl font-bold text-primary">{personalList.length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Personal con Líneas
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {totalConLineas}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Departamentos
              </p>
              <p className="text-2xl font-bold text-indigo-600">{departamentosUnicos.length}</p>
            </div>
          </div>

          {/* Filtros y Botón */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Buscar colaborador
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, cargo o depto..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por Departamento
                </label>
                <select
                  value={filtroDepartamento}
                  onChange={(e) => setFiltroDepartamento(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentosUnicos.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={abrirModalRegistro}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Registrar Personal
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Personal */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Colaborador
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Departamento
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Cargo
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Líneas Asignadas
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Costo Mensual Total
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {personalFiltrado.length > 0 ? (
                    personalFiltrado.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-black dark:text-white text-sm">{p.nombre}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold">
                          <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs">
                            {p.departamento}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {p.cargo}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => verLineasDePersonal(p)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                              Number(p.total_lineas) > 0
                                ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                            }`}
                            title="Ver líneas asignadas a este colaborador"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{p.total_lineas || 0} {Number(p.total_lineas) === 1 ? "línea" : "líneas"}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          Bs. {parseFloat(String(p.costo_total_mensual || 0)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => verLineasDePersonal(p)}
                              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                              title="Ver detalle de líneas"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => abrirModalEdicion(p)}
                              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                              title="Editar Personal"
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
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No se encontró personal registrado con los filtros indicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Ver Líneas Asignadas al Colaborador */}
      {modalLineasAbierto && personalSeleccionado && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                  Líneas Asignadas a {personalSeleccionado.nombre}
                </h3>
                <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                  {personalSeleccionado.cargo} • {personalSeleccionado.departamento}
                </p>
              </div>
              <button
                onClick={cerrarModalLineas}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
              {cargandoLineas ? (
                <div className="py-12 text-center text-primary font-bold">Cargando líneas del personal...</div>
              ) : lineasDelPersonal.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/40 p-3">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Total Líneas</p>
                      <p className="text-xl font-bold text-primary">{lineasDelPersonal.length}</p>
                    </div>
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/40 p-3">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Líneas Activas</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {lineasDelPersonal.filter((l) => l.estado === "ACTIVA").length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/40 p-3">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Costo Mensual Acumulado</p>
                      <p className="text-xl font-bold text-emerald-600">
                        Bs.{" "}
                        {lineasDelPersonal
                          .reduce(
                            (acc, l) => (l.estado === "ACTIVA" ? acc + parseFloat(String(l.plan_costo || 0)) : acc),
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Número</th>
                          <th className="px-4 py-3 text-left font-bold">Telefonía</th>
                          <th className="px-4 py-3 text-left font-bold">Plan</th>
                          <th className="px-4 py-3 text-right font-bold">Costo</th>
                          <th className="px-4 py-3 text-left font-bold">Equipo Celular</th>
                          <th className="px-4 py-3 text-center font-bold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lineasDelPersonal.map((linea) => (
                          <tr key={linea.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 font-mono font-bold text-black dark:text-white text-sm">
                              {linea.numero}
                            </td>
                            <td className="px-4 py-3 font-bold text-primary">
                              {linea.telefonia_nombre}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {linea.plan_nombre}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                              Bs. {parseFloat(String(linea.plan_costo || 0)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {linea.celular_codigo ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-black dark:text-white text-xs">
                                  <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    {linea.celular_codigo}
                                  </span>
                                  {linea.celular_modelo || linea.celular_nombre}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic text-xs">Solo Chip</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${getColorEstadoLinea(
                                  linea.estado
                                )}`}
                              >
                                {getNombreEstadoLinea(linea.estado)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  Este colaborador actualmente no tiene ninguna línea telefónica asignada.
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
              <button
                type="button"
                onClick={cerrarModalLineas}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales Modularizados de Personal */}
      <ModalCrearEditarPersonal
        isOpen={modalRegistroAbierto}
        modoEdicion={false}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={handleRegistroSubmit}
        onClose={cerrarModalRegistro}
      />

      <ModalCrearEditarPersonal
        isOpen={modalEdicionAbierto}
        modoEdicion={true}
        personalSeleccionado={personalSeleccionado}
        formData={datosEdicion}
        setFormData={setDatosEdicion}
        onSubmit={handleEdicionSubmit}
        onClose={cerrarModalEdicion}
      />

      <InfoModal
        isOpen={modalInfo}
        onClose={() => setModalInfo(false)}
        title="Acción Restringida"
        message="Para eliminar un personal primero debes reasignar o dar de baja las líneas asignadas."
      />
    </>
  );
};

export default PersonalPage;