"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import {
  lineaService,
  Telefonia,
  PlanTelefonia,
  Personal,
  EstadoLinea,
} from "@/services/linea.service";
import { useToast } from "@/contexts/ToastContext";

const RegistrarLineaPage = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [personalList, setPersonalList] = useState<Personal[]>([]);

  // Form states
  const [numero, setNumero] = useState("");
  const [equipoAsignado, setEquipoAsignado] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const [personalId, setPersonalId] = useState<string>("");
  const [estado, setEstado] = useState<EstadoLinea>("ACTIVA");
  const [observaciones, setObservaciones] = useState("");

  // Modales rápidos
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false);
  const [modalNuevoPersonal, setModalNuevoPersonal] = useState(false);

  // Estados de formularios rápidos
  const [datosNuevoPlan, setDatosNuevoPlan] = useState<{
    telefonia_id: string;
    nombre: string;
    costo: string;
    descripcion: string;
  }>({
    telefonia_id: "",
    nombre: "",
    costo: "",
    descripcion: "",
  });

  const [datosNuevoPersonal, setDatosNuevoPersonal] = useState({
    nombre: "",
    departamento: "",
    cargo: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Registrar Línea Telefónica | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [telefoniasData, planesData, personalData] = await Promise.all([
        lineaService.getTelefonias(),
        lineaService.getPlanes({ estado: "DISPONIBLE" }),
        lineaService.getPersonal(),
      ]);

      setTelefonias(telefoniasData || []);
      setPlanes(planesData || []);
      setPersonalList((personalData || []).filter((p) => p.estado === "ACTIVO"));

      if (planesData && planesData.length > 0 && !planId) {
        setPlanId(String(planesData[0].id));
      }
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar listas de selección");
    } finally {
      hideLoading();
    }
  };

  const abrirModalNuevoPlan = () => {
    setDatosNuevoPlan({
      telefonia_id: telefonias.length > 0 ? String(telefonias[0].id) : "",
      nombre: "",
      costo: "",
      descripcion: "",
    });
    setModalNuevoPlan(true);
  };

  const handleCrearPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosNuevoPlan.telefonia_id || !datosNuevoPlan.nombre.trim() || !datosNuevoPlan.costo) {
      toast.error("Campos requeridos", "Por favor completa la telefonía, nombre y costo");
      return;
    }

    showLoading();
    try {
      const nuevo = await lineaService.createPlan({
        telefonia_id: parseInt(datosNuevoPlan.telefonia_id),
        nombre: datosNuevoPlan.nombre.trim(),
        costo: parseFloat(datosNuevoPlan.costo),
        estado: "DISPONIBLE",
        descripcion: datosNuevoPlan.descripcion.trim() || undefined,
      });

      toast.success("Plan creado", "El plan ha sido registrado y seleccionado");
      setModalNuevoPlan(false);
      
      const planesActualizados = await lineaService.getPlanes({ estado: "DISPONIBLE" });
      setPlanes(planesActualizados || []);
      if (nuevo?.id) {
        setPlanId(String(nuevo.id));
      }
    } catch (err: any) {
      toast.error("Error al crear plan", err.message || "No se pudo registrar el plan");
    } finally {
      hideLoading();
    }
  };

  const abrirModalNuevoPersonal = () => {
    setDatosNuevoPersonal({
      nombre: "",
      departamento: "",
      cargo: "",
    });
    setModalNuevoPersonal(true);
  };

  const handleCrearPersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosNuevoPersonal.nombre.trim() || !datosNuevoPersonal.departamento.trim() || !datosNuevoPersonal.cargo.trim()) {
      toast.error("Campos requeridos", "Por favor completa el nombre, departamento y cargo");
      return;
    }

    showLoading();
    try {
      const nuevo = await lineaService.createPersonal({
        nombre: datosNuevoPersonal.nombre.trim(),
        departamento: datosNuevoPersonal.departamento.trim(),
        cargo: datosNuevoPersonal.cargo.trim(),
        estado: "ACTIVO",
      });

      toast.success("Personal registrado", "El colaborador ha sido registrado y seleccionado");
      setModalNuevoPersonal(false);

      const personalActualizado = await lineaService.getPersonal();
      setPersonalList((personalActualizado || []).filter((p) => p.estado === "ACTIVO"));
      if (nuevo?.id) {
        setPersonalId(String(nuevo.id));
      }
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar el personal");
    } finally {
      hideLoading();
    }
  };

  const planSeleccionado = planes.find((p) => String(p.id) === planId);
  const colaboradorSeleccionado = personalList.find((p) => String(p.id) === personalId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) {
      toast.error("Campo requerido", "Por favor ingresa el número telefónico");
      return;
    }
    if (!planId) {
      toast.error("Campo requerido", "Por favor selecciona un plan telefónico");
      return;
    }

    showLoading();
    try {
      await lineaService.create({
        numero: numero.trim(),
        equipo_asignado: equipoAsignado.trim() || undefined,
        plan_id: parseInt(planId),
        personal_id: personalId ? parseInt(personalId) : null,
        estado: personalId ? estado : "DISPONIBLE",
        observaciones: observaciones.trim() || undefined,
      });

      toast.success("Línea registrada", "La línea telefónica ha sido creada exitosamente");
      router.push("/admin/lineas/lista");
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar la línea");
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Registrar Línea Telefónica"
        description="Asignación de números corporativos, planes tarifarios y equipos a colaboradores"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: DATOS DE LA LÍNEA Y EQUIPO */}
            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2">
                1. Información de la Línea y Equipo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                    Número Telefónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ej: 70123456"
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary font-mono text-sm"
                  />
                  <p className="mt-1 text-[10px] text-body-color dark:text-gray-400">
                    Número único de la línea corporativa.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                    Equipo Asignado
                  </label>
                  <input
                    type="text"
                    value={equipoAsignado}
                    onChange={(e) => setEquipoAsignado(e.target.value)}
                    placeholder="Ej: iPhone 13 Pro, Samsung Galaxy S22, Solo Chip"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-[10px] text-body-color dark:text-gray-400">
                    Modelo o marca del celular asignado (o &ldquo;Solo Chip&rdquo; si no aplica).
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PLAN TELEFÓNICO */}
            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
                  2. Plan Telefónico Contratado
                </h3>
                <button
                  type="button"
                  onClick={abrirModalNuevoPlan}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Plan
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                  Seleccionar Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Seleccionar Plan Telefónico --</option>
                  {telefonias.map((tel) => {
                    const planesDeTel = planes.filter((p) => p.telefonia_id === tel.id);
                    if (planesDeTel.length === 0) return null;
                    return (
                      <optgroup key={tel.id} label={`Telefonía ${tel.nombre}`}>
                        {planesDeTel.map((p) => (
                          <option key={p.id} value={p.id}>
                            {tel.nombre} — {p.nombre} (Bs. {parseFloat(String(p.costo)).toFixed(2)}/mes)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <p className="mt-1 text-[10px] text-body-color dark:text-gray-400">
                  La empresa de telefonía y tarifa mensual se asignan automáticamente según el plan seleccionado.
                </p>
              </div>

              {planSeleccionado && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                        {planSeleccionado.telefonia_nombre || "Operadora"}
                      </span>
                      <p className="text-xs font-bold text-black dark:text-white">
                        {planSeleccionado.nombre}
                      </p>
                    </div>
                    {planSeleccionado.descripcion && (
                      <p className="text-[10px] text-body-color dark:text-gray-400 mt-1">
                        {planSeleccionado.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-500">Costo Mensual</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      Bs. {parseFloat(String(planSeleccionado.costo)).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: ASIGNACIÓN DE PERSONAL */}
            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
                  3. Asignación de Personal
                </h3>
                <button
                  type="button"
                  onClick={abrirModalNuevoPersonal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Personal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                    Colaborador Responsable
                  </label>
                  <select
                    value={personalId}
                    onChange={(e) => setPersonalId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Sin asignar (Línea Disponible en Stock) --</option>
                    {personalList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {p.cargo} ({p.departamento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                    Estado de la Línea <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoLinea)}
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="DISPONIBLE">Disponible (En Stock)</option>
                    <option value="SUSPENDIDA">Suspendida</option>
                  </select>
                </div>
              </div>

              {colaboradorSeleccionado && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary">
                      {colaboradorSeleccionado.nombre}
                    </p>
                    <p className="text-[11px] text-body-color dark:text-gray-300 mt-0.5">
                      {colaboradorSeleccionado.cargo} • {colaboradorSeleccionado.departamento}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold">
                      Personal Activo
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-bold text-black dark:text-white">
                  Observaciones Adicionales
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre entrega del chip, código PIN/PUK, etc..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/admin/lineas/lista"
                className="rounded-xl border border-gray-300 dark:border-gray-700 px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="rounded-xl bg-primary px-8 py-3 text-xs font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                Registrar Línea
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* MINI MODAL: CREAR PLAN RÁPIDO */}
      {modalNuevoPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Registrar Nuevo Plan Telefónico
              </h3>
              <button
                type="button"
                onClick={() => setModalNuevoPlan(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrearPlanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Telefonía <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={datosNuevoPlan.telefonia_id}
                    onChange={(e) => setDatosNuevoPlan({ ...datosNuevoPlan, telefonia_id: e.target.value })}
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Operadora --</option>
                    {telefonias.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Costo (Bs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={datosNuevoPlan.costo}
                    onChange={(e) => setDatosNuevoPlan({ ...datosNuevoPlan, costo: e.target.value })}
                    placeholder="Ej: 100.00"
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Nombre del Plan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoPlan.nombre}
                  onChange={(e) => setDatosNuevoPlan({ ...datosNuevoPlan, nombre: e.target.value })}
                  placeholder="Ej: EMPRESARIAL 100"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={datosNuevoPlan.descripcion}
                  onChange={(e) => setDatosNuevoPlan({ ...datosNuevoPlan, descripcion: e.target.value })}
                  placeholder="Ej: 10GB + llamadas ilimitadas"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalNuevoPlan(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINI MODAL: CREAR PERSONAL RÁPIDO */}
      {modalNuevoPersonal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Registrar Nuevo Colaborador
              </h3>
              <button
                type="button"
                onClick={() => setModalNuevoPersonal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrearPersonalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoPersonal.nombre}
                  onChange={(e) => setDatosNuevoPersonal({ ...datosNuevoPersonal, nombre: e.target.value })}
                  placeholder="Ej: Daniela Robles"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Departamento / Área <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoPersonal.departamento}
                  onChange={(e) => setDatosNuevoPersonal({ ...datosNuevoPersonal, departamento: e.target.value })}
                  placeholder="Ej: Recursos Humanos, Contabilidad"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Cargo / Puesto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoPersonal.cargo}
                  onChange={(e) => setDatosNuevoPersonal({ ...datosNuevoPersonal, cargo: e.target.value })}
                  placeholder="Ej: Jefe de Recursos Humanos"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalNuevoPersonal(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Guardar Personal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrarLineaPage;