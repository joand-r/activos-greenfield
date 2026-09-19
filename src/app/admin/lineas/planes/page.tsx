"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import {
  lineaService,
  PlanTelefonia,
  Telefonia,
  EstadoPlan,
  getColorEstadoPlan,
  getNombreEstadoPlan,
} from "@/services/linea.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalCrearEditarPlan } from "@/components/modals";
import { useModalState, useDataTable } from "@/hooks";
import { PaginationControl } from "@/components/ui/PaginationControl";

const PlanesTelefoniaPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [filtroTelefonia, setFiltroTelefonia] = useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPlan | "">("");
  const [error, setError] = useState("");

  // Modales
  const modalEdicion = useModalState<PlanTelefonia>();
  const modalRegistro = useModalState();
  const modalInfo = useModalState();

  // Estados de formularios
  const [datosEdicion, setDatosEdicion] = useState<{
    telefonia_id: string;
    nombre: string;
    costo: string;
    estado: EstadoPlan;
    descripcion: string;
  }>({
    telefonia_id: "",
    nombre: "",
    costo: "",
    estado: "DISPONIBLE",
    descripcion: "",
  });

  const [datosRegistro, setDatosRegistro] = useState<{
    telefonia_id: string;
    nombre: string;
    costo: string;
    estado: EstadoPlan;
    descripcion: string;
  }>({
    telefonia_id: "",
    nombre: "",
    costo: "",
    estado: "DISPONIBLE",
    descripcion: "",
  });

  // Hook DataTable para búsqueda con debounce, filtrado y paginación
  const {
    searchTerm: busqueda,
    setSearchTerm: setBusqueda,
    paginatedData: planesPaginados,
    totalFiltered,
    pagination,
  } = useDataTable<PlanTelefonia>({
    data: planes,
    searchFields: ["nombre", "telefonia_nombre", "descripcion"],
    pageSize: 10,
    filterFn: (plan) => {
      if (filtroTelefonia && plan.telefonia_id !== Number(filtroTelefonia)) return false;
      if (filtroEstado && plan.estado !== filtroEstado) return false;
      return true;
    },
  });

  useEffect(() => {
    document.title = "Planes Telefónicos | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [planesData, telefoniasData] = await Promise.all([
        lineaService.getPlanes(),
        lineaService.getTelefonias(),
      ]);
      setPlanes(planesData || []);
      setTelefonias(telefoniasData || []);
    } catch (err: any) {
      console.error("Error al cargar planes:", err);
      setError(err.message || "Error al cargar los planes");
    } finally {
      hideLoading();
    }
  };

  const abrirModalRegistro = () => {
    setDatosRegistro({
      telefonia_id: telefonias.length > 0 ? String(telefonias[0].id) : "",
      nombre: "",
      costo: "",
      estado: "DISPONIBLE",
      descripcion: "",
    });
    modalRegistro.open();
  };

  const abrirModalEdicion = (plan: PlanTelefonia) => {
    setDatosEdicion({
      telefonia_id: String(plan.telefonia_id),
      nombre: plan.nombre,
      costo: String(plan.costo),
      estado: plan.estado,
      descripcion: plan.descripcion || "",
    });
    modalEdicion.open(plan);
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosRegistro.telefonia_id || !datosRegistro.nombre.trim() || !datosRegistro.costo) {
      toast.error("Campos requeridos", "Por favor completa la telefonía, nombre y costo del plan");
      return;
    }

    showLoading();
    try {
      await lineaService.createPlan({
        telefonia_id: parseInt(datosRegistro.telefonia_id),
        nombre: datosRegistro.nombre.trim(),
        costo: parseFloat(datosRegistro.costo),
        estado: datosRegistro.estado,
        descripcion: datosRegistro.descripcion.trim() || undefined,
      });
      toast.success("Plan registrado", "El plan ha sido creado exitosamente");
      modalRegistro.close();
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al crear plan", err.message || "No se pudo crear el plan");
    } finally {
      hideLoading();
    }
  };

  const handleEdicionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicion.data) return;
    if (!datosEdicion.nombre.trim() || !datosEdicion.costo) {
      toast.error("Campos requeridos", "El nombre y costo son obligatorios");
      return;
    }

    showLoading();
    try {
      await lineaService.updatePlan(modalEdicion.data.id, {
        telefonia_id: datosEdicion.telefonia_id ? parseInt(datosEdicion.telefonia_id) : undefined,
        nombre: datosEdicion.nombre.trim(),
        costo: parseFloat(datosEdicion.costo),
        estado: datosEdicion.estado,
        descripcion: datosEdicion.descripcion.trim() || undefined,
      });
      toast.success("Plan actualizado", "Los cambios han sido guardados exitosamente");
      modalEdicion.close();
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar el plan");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Planes Telefónicos"
        description="Administración de planes mensuales por telefonía, control de tarifas y estado de disponibilidad"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Estadísticas de Planes */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Total Planes
              </p>
              <p className="text-2xl font-bold text-primary">{planes.length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Planes Disponibles
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {planes.filter((p) => p.estado === "DISPONIBLE").length}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                Planes No Disponibles (Históricos)
              </p>
              <p className="text-2xl font-bold text-zinc-500">
                {planes.filter((p) => p.estado === "NO_DISPONIBLE").length}
              </p>
            </div>
          </div>

          {/* Filtros y Acción */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Buscar plan
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: EMPRESARIAL 100..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por telefonía
                </label>
                <select
                  value={filtroTelefonia}
                  onChange={(e) => setFiltroTelefonia(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todas las telefonías</option>
                  {telefonias.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as EstadoPlan | "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="NO_DISPONIBLE">No Disponible</option>
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
                  Nuevo Plan
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Planes */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Telefonía
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Nombre del Plan
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Costo Mensual
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
                  {planesPaginados.length > 0 ? (
                    planesPaginados.map((plan) => (
                      <tr
                        key={plan.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-black dark:text-white">
                          <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            {plan.telefonia_nombre || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-black dark:text-white text-sm">
                          {plan.nombre}
                          {plan.descripcion && (
                            <p className="text-[10px] font-normal text-body-color dark:text-gray-400 mt-0.5">
                              {plan.descripcion}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          Bs. {parseFloat(String(plan.costo)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-black dark:text-white">
                          {plan.total_lineas || 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${getColorEstadoPlan(
                              plan.estado
                            )}`}
                          >
                            {getNombreEstadoPlan(plan.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => abrirModalEdicion(plan)}
                              className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                              title="Editar Plan"
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
                        No se encontraron planes registrados con los filtros seleccionados.
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
              itemName="planes"
            />
          </div>
        </div>
      </section>

      {/* Modales Modularizados de Plan */}
      <ModalCrearEditarPlan
        isOpen={modalRegistro.isOpen}
        modoEdicion={false}
        telefonias={telefonias}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={handleRegistroSubmit}
        onClose={modalRegistro.close}
      />

      <ModalCrearEditarPlan
        isOpen={modalEdicion.isOpen}
        modoEdicion={true}
        planSeleccionado={modalEdicion.data}
        telefonias={telefonias}
        formData={datosEdicion}
        setFormData={setDatosEdicion}
        onSubmit={handleEdicionSubmit}
        onClose={modalEdicion.close}
      />

      <InfoModal
        isOpen={modalInfo.isOpen}
        onClose={modalInfo.close}
        title="Acción Restringida"
        message="Para eliminar un plan no debe tener líneas telefónicas asignadas."
      />
    </>
  );
};

export default PlanesTelefoniaPage;
