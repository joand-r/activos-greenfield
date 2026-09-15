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
import { activoService, Activo } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { useToast } from "@/contexts/ToastContext";

const RegistrarLineaPage = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [celulares, setCelulares] = useState<Activo[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Form states
  const [numero, setNumero] = useState("");
  const [activoId, setActivoId] = useState<string>("");
  const [planId, setPlanId] = useState<string>("");
  const [personalId, setPersonalId] = useState<string>("");
  const [estado, setEstado] = useState<EstadoLinea>("ACTIVA");
  const [observaciones, setObservaciones] = useState("");

  // Modales rápidos
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false);
  const [modalNuevoPersonal, setModalNuevoPersonal] = useState(false);
  const [modalNuevoCelular, setModalNuevoCelular] = useState(false);

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

  const [datosNuevoCelular, setDatosNuevoCelular] = useState<{
    nombre: string;
    modelo: string;
    marca_id: string;
    lugar_id: string;
    proveedor_id: string;
    serie: string;
    memoria: string;
    capacidad_disco: string;
    procesador: string;
    imei_1: string;
    imei_2: string;
    accesorios: string;
    fecha_adquision: string;
    costo_adquision: string;
  }>({
    nombre: "",
    modelo: "",
    marca_id: "",
    lugar_id: "",
    proveedor_id: "",
    serie: "",
    memoria: "",
    capacidad_disco: "",
    procesador: "",
    imei_1: "",
    imei_2: "",
    accesorios: "",
    fecha_adquision: "",
    costo_adquision: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Registrar Línea Telefónica | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [telefoniasData, planesData, personalData, celularesData, lugaresData, marcasData, proveedoresData] =
        await Promise.all([
          lineaService.getTelefonias(),
          lineaService.getPlanes({ estado: "DISPONIBLE" }),
          lineaService.getPersonal(),
          activoService.getAll({ tipo_activo: "CELULAR" }),
          lugarService.getAll(),
          marcaService.getAll(),
          proveedorService.getAll(),
        ]);

      setTelefonias(telefoniasData || []);
      setPlanes(planesData || []);
      setPersonalList((personalData || []).filter((p) => p.estado === "ACTIVO"));
      setCelulares(celularesData || []);
      setLugares(lugaresData || []);
      setMarcas(marcasData || []);
      setProveedores(proveedoresData || []);

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

  const abrirModalNuevoCelular = () => {
    setDatosNuevoCelular({
      nombre: "",
      modelo: "",
      marca_id: marcas.length > 0 ? String(marcas[0].id) : "",
      lugar_id: lugares.length > 0 ? String(lugares[0].id) : "",
      proveedor_id: "",
      serie: "",
      memoria: "",
      capacidad_disco: "",
      procesador: "",
      imei_1: "",
      imei_2: "",
      accesorios: "",
      fecha_adquision: "",
      costo_adquision: "",
    });
    setModalNuevoCelular(true);
  };

  const handleCrearCelularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosNuevoCelular.nombre.trim() || !datosNuevoCelular.modelo.trim() || !datosNuevoCelular.lugar_id) {
      toast.error("Campos requeridos", "Por favor completa el nombre, modelo y ubicación del celular");
      return;
    }

    showLoading();
    try {
      const nuevoActivo = await activoService.create({
        nombre: datosNuevoCelular.nombre.trim(),
        tipo_activo: "CELULAR",
        clasificacion: "MENOR",
        lugar_id: parseInt(datosNuevoCelular.lugar_id),
        marca_id: datosNuevoCelular.marca_id ? parseInt(datosNuevoCelular.marca_id) : undefined,
        proveedor_id: datosNuevoCelular.proveedor_id ? parseInt(datosNuevoCelular.proveedor_id) : undefined,
        serie: datosNuevoCelular.serie.trim() || undefined,
        estado: "DISPONIBLE",
        fecha_adquision: datosNuevoCelular.fecha_adquision || undefined,
        costo_adquision: datosNuevoCelular.costo_adquision ? parseFloat(datosNuevoCelular.costo_adquision) : undefined,
        datos_especificos: {
          modelo: datosNuevoCelular.modelo.trim(),
          procesador: datosNuevoCelular.procesador.trim() || undefined,
          memoria: datosNuevoCelular.memoria.trim() || undefined,
          capacidad_disco: datosNuevoCelular.capacidad_disco.trim() || undefined,
          imei_1: datosNuevoCelular.imei_1.trim() || undefined,
          imei_2: datosNuevoCelular.imei_2.trim() || undefined,
          accesorios: datosNuevoCelular.accesorios.trim() || undefined,
        },
      });

      toast.success("Celular registrado", "El celular ha sido creado y seleccionado automáticamente");
      setModalNuevoCelular(false);

      const celularesActualizados = await activoService.getAll({ tipo_activo: "CELULAR" });
      setCelulares(celularesActualizados || []);
      if (nuevoActivo?.id) {
        setActivoId(String(nuevoActivo.id));
      }
    } catch (err: any) {
      toast.error("Error al registrar celular", err.message || "No se pudo registrar el celular");
    } finally {
      hideLoading();
    }
  };

  const planSeleccionado = planes.find((p) => String(p.id) === planId);
  const colaboradorSeleccionado = personalList.find((p) => String(p.id) === personalId);
  const celularSeleccionado = celulares.find((c) => String(c.id) === activoId);

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
        activo_id: activoId ? parseInt(activoId) : null,
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
        description="Asignación de números corporativos, planes tarifarios y activos celulares a colaboradores"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: DATOS DE LA LÍNEA Y EQUIPO CELULAR */}
            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2">
                1. Información de la Línea y Equipo Celular
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-black dark:text-white">
                      Equipo Celular
                    </label>
                    <button
                      type="button"
                      onClick={abrirModalNuevoCelular}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      title="Registrar un nuevo celular y seleccionarlo automáticamente"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nuevo Celular
                    </button>
                  </div>
                  <select
                    value={activoId}
                    onChange={(e) => setActivoId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Sin Celular (Solo Chip) --</option>
                    {celulares.map((cel) => {
                      const datos = cel.datos_especificos as any;
                      const modelo = datos?.modelo;
                      const imei1 = datos?.imei_1;
                      return (
                        <option key={cel.id} value={cel.id}>
                          [{cel.codigo}] {cel.nombre} {modelo ? `— ${modelo}` : ""} {imei1 ? `(IMEI: ${imei1})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="mt-1 text-[10px] text-body-color dark:text-gray-400">
                    Selecciona el celular asignado desde el inventario de activos.
                  </p>
                </div>
              </div>

              {celularSeleccionado && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-md">
                        {celularSeleccionado.codigo}
                      </span>
                      <p className="text-xs font-bold text-black dark:text-white">
                        {celularSeleccionado.nombre}
                      </p>
                      {(celularSeleccionado.datos_especificos as any)?.modelo && (
                        <span className="text-xs text-body-color dark:text-gray-300">
                          • {(celularSeleccionado.datos_especificos as any).modelo}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-body-color dark:text-gray-400 mt-1.5">
                      {(celularSeleccionado.datos_especificos as any)?.memoria && (
                        <span>RAM: <strong className="text-black dark:text-white">{(celularSeleccionado.datos_especificos as any).memoria}</strong></span>
                      )}
                      {(celularSeleccionado.datos_especificos as any)?.capacidad_disco && (
                        <span>Almacenamiento: <strong className="text-black dark:text-white">{(celularSeleccionado.datos_especificos as any).capacidad_disco}</strong></span>
                      )}
                      {(celularSeleccionado.datos_especificos as any)?.imei_1 && (
                        <span>IMEI 1: <strong className="font-mono text-black dark:text-white">{(celularSeleccionado.datos_especificos as any).imei_1}</strong></span>
                      )}
                      {(celularSeleccionado.datos_especificos as any)?.imei_2 && (
                        <span>IMEI 2: <strong className="font-mono text-black dark:text-white">{(celularSeleccionado.datos_especificos as any).imei_2}</strong></span>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-flex items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold">
                      Activo Celular
                    </span>
                  </div>
                </div>
              )}
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

      {/* MINI MODAL: REGISTRAR NUEVO CELULAR RÁPIDO */}
      {modalNuevoCelular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Registrar Nuevo Equipo Celular
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Se creará en el inventario y se seleccionará automáticamente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoCelular(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrearCelularSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Nombre del Dispositivo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.nombre}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, nombre: e.target.value })}
                    placeholder="Ej: Samsung Galaxy A54"
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.modelo}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, modelo: e.target.value })}
                    placeholder="Ej: SM-A546E / 128GB"
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Ubicación / Lugar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={datosNuevoCelular.lugar_id}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, lugar_id: e.target.value })}
                    required
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Seleccionar Ubicación --</option>
                    {lugares.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre} ({l.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Marca
                  </label>
                  <select
                    value={datosNuevoCelular.marca_id}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, marca_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Seleccionar Marca --</option>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.serie}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, serie: e.target.value })}
                    placeholder="Ej: R58N71ABCDE"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Procesador
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.procesador}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, procesador: e.target.value })}
                    placeholder="Ej: Octa-Core 2.4 GHz"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Memoria RAM
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.memoria}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, memoria: e.target.value })}
                    placeholder="Ej: 8 GB"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Almacenamiento Interno
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.capacidad_disco}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, capacidad_disco: e.target.value })}
                    placeholder="Ej: 128 GB o 256 GB"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    IMEI 1
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.imei_1}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, imei_1: e.target.value })}
                    placeholder="Ej: 358943112345678"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    IMEI 2 (Opcional)
                  </label>
                  <input
                    type="text"
                    value={datosNuevoCelular.imei_2}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, imei_2: e.target.value })}
                    placeholder="Ej: 358943112345679"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Accesorios Incluidos
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.accesorios}
                  onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, accesorios: e.target.value })}
                  placeholder="Ej: Cargador original, funda transparente, cable Tipo-C"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Proveedor
                  </label>
                  <select
                    value={datosNuevoCelular.proveedor_id}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, proveedor_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  >
                    <option value="">-- Proveedor --</option>
                    {proveedores.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Fecha Compra
                  </label>
                  <input
                    type="date"
                    value={datosNuevoCelular.fecha_adquision}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, fecha_adquision: e.target.value })}
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Costo (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={datosNuevoCelular.costo_adquision}
                    onChange={(e) => setDatosNuevoCelular({ ...datosNuevoCelular, costo_adquision: e.target.value })}
                    placeholder="0.00"
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalNuevoCelular(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Guardar y Asignar Celular
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