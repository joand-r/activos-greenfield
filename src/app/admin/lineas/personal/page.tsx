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
import { useModalState, useDataTable } from "@/hooks";
import { PaginationControl } from "@/components/ui/PaginationControl";

const PersonalPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [error, setError] = useState("");

  // Modales gestionados con useModalState
  const modalEdicion = useModalState<Personal>();
  const modalRegistro = useModalState();
  const modalLineas = useModalState<Personal>();
  const modalInfo = useModalState();

  const [lineasDelPersonal, setLineasDelPersonal] = useState<Linea[]>([]);
  const [cargandoLineas, setCargandoLineas] = useState(false);

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

  // Departamentos únicos para el filtro
  const departamentos = useMemo(() => {
    const deps = new Set(personalList.map((p) => p.departamento).filter(Boolean));
    return Array.from(deps);
  }, [personalList]);

  // Hook DataTable para búsqueda con debounce, filtrado y paginación
  const {
    searchTerm: busqueda,
    setSearchTerm: setBusqueda,
    paginatedData: personalPaginado,
    totalFiltered,
    pagination,
  } = useDataTable<Personal>({
    data: personalList,
    searchFields: ["nombre", "departamento", "cargo"],
    pageSize: 10,
    filterFn: (p) => {
      if (filtroDepartamento && p.departamento !== filtroDepartamento) return false;
      return true;
    },
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
    modalRegistro.open();
  };

  const abrirModalEdicion = (p: Personal) => {
    setDatosEdicion({
      nombre: p.nombre,
      departamento: p.departamento,
      cargo: p.cargo,
      estado: p.estado,
    });
    modalEdicion.open(p);
  };

  const verLineasDePersonal = async (p: Personal) => {
    modalLineas.open(p);
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
      modalRegistro.close();
      cargarPersonal();
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar el personal");
    } finally {
      hideLoading();
    }
  };

  const handleEdicionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicion.data) return;
    if (!datosEdicion.nombre.trim() || !datosEdicion.departamento.trim() || !datosEdicion.cargo.trim()) {
      toast.error("Campos requeridos", "Por favor completa todos los campos obligatorios");
      return;
    }

    showLoading();
    try {
      await lineaService.updatePersonal(modalEdicion.data.id, {
        nombre: datosEdicion.nombre.trim(),
        departamento: datosEdicion.departamento.trim(),
        cargo: datosEdicion.cargo.trim(),
        estado: datosEdicion.estado,
      });
      toast.success("Personal actualizado", "Los datos han sido guardados exitosamente");
      modalEdicion.close();
      cargarPersonal();
    } catch (err: any) {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar el colaborador");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Personal de la Empresa"
        description="Gestión de colaboradores, asignación de líneas corporativas y control por departamento"
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
                Total Colaboradores
              </p>
              <p className="text-2xl font-bold text-primary">{personalList.length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Colaboradores con Línea Asignada
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {personalList.filter((p) => (p.total_lineas || 0) > 0).length}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Departamentos Registrados
              </p>
              <p className="text-2xl font-bold text-indigo-600">{departamentos.length}</p>
            </div>
          </div>

          {/* Barra de Filtros y Acciones */}
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
                  placeholder="Ej: Daniela Robles, Soporte..."
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
                  {departamentos.map((dep) => (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Registrar Colaborador
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
                      Nombre Completo
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Departamento
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Cargo / Puesto
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Líneas Asignadas
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {personalPaginado.length > 0 ? (
                    personalPaginado.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-black dark:text-white text-sm">
                          {p.nombre}
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">
                          {p.departamento}
                        </td>
                        <td className="px-6 py-4 text-body-color dark:text-gray-300">
                          {p.cargo}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => verLineasDePersonal(p)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 font-bold text-xs transition-colors cursor-pointer"
                            title="Ver líneas asignadas a este colaborador"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {p.total_lineas || 0} línea(s)
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                              p.estado === "ACTIVO"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
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
                        No se encontraron colaboradores registrados con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <PaginationControl
              pagination={pagination}
              totalItems={totalFiltered}
              itemName="colaboradores"
            />
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      <ModalCrearEditarPersonal
        isOpen={modalRegistro.isOpen}
        modoEdicion={false}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={handleRegistroSubmit}
        onClose={modalRegistro.close}
      />

      {/* Modal de Edición */}
      <ModalCrearEditarPersonal
        isOpen={modalEdicion.isOpen}
        modoEdicion={true}
        personalSeleccionado={modalEdicion.data}
        formData={datosEdicion}
        setFormData={setDatosEdicion}
        onSubmit={handleEdicionSubmit}
        onClose={modalEdicion.close}
      />

      {/* Modal de Líneas Asignadas */}
      {modalLineas.isOpen && modalLineas.data && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
            <div className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Líneas Asignadas a {modalLineas.data.nombre}
                </h3>
                <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                  {modalLineas.data.cargo} • {modalLineas.data.departamento}
                </p>
              </div>
              <button
                onClick={modalLineas.close}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {cargandoLineas ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  Cargando líneas telefónicas asignadas...
                </div>
              ) : lineasDelPersonal.length > 0 ? (
                lineasDelPersonal.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-black dark:text-white">
                          {l.numero}
                        </span>
                        <span className="inline-flex rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {l.telefonia_nombre || "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-body-color dark:text-gray-400 mt-1">
                        Plan: <strong className="text-black dark:text-white">{l.plan_nombre}</strong> (Bs. {parseFloat(String(l.plan_costo || 0)).toFixed(2)}/mes)
                      </p>
                      {l.celular_codigo && (
                        <p className="text-xs text-primary font-medium mt-0.5">
                          Equipo: [{l.celular_codigo}] {l.celular_modelo || l.celular_nombre}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${getColorEstadoLinea(
                        l.estado
                      )}`}
                    >
                      {getNombreEstadoLinea(l.estado)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Este colaborador no tiene líneas corporativas asignadas actualmente.
                </div>
              )}
            </div>

            <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={modalLineas.close}
                className="rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-800 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo */}
      <InfoModal
        isOpen={modalInfo.isOpen}
        onClose={modalInfo.close}
        title="Acción Restringida"
        message="Por motivos de auditoría, no se pueden eliminar registros de colaboradores con historial."
      />
    </>
  );
};

export default PersonalPage;
