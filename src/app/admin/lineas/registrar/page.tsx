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
  CelularLinea,
} from "@/services/linea.service";
import { activoService } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import { useToast } from "@/contexts/ToastContext";
import {
  ModalCrearEditarPlan,
  ModalCrearEditarPersonal,
  ModalCrearCelular,
} from "@/components/modals";

const RegistrarLineaPage = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [celulares, setCelulares] = useState<CelularLinea[]>([]);
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
      // 1. Carga inmediata de datos principales del formulario
      const [telefoniasData, planesData, personalData, celularesData] = await Promise.all([
        lineaService.getTelefonias(),
        lineaService.getPlanes({ estado: "DISPONIBLE" }),
        lineaService.getPersonal(),
        lineaService.getCelulares(),
      ]);

      setTelefonias(telefoniasData || []);
      setPlanes(planesData || []);
      setPersonalList((personalData || []).filter((p) => p.estado === "ACTIVO"));
      setCelulares(celularesData || []);

      if (planesData && planesData.length > 0 && !planId) {
        setPlanId(String(planesData[0].id));
      }
      hideLoading();

      // 2. Carga secundaria no bloqueante de marcas, lugares y proveedores para submodal
      Promise.all([
        lugarService.getAll(),
        marcaService.getAll(),
        proveedorService.getAll(),
      ]).then(([lugaresData, marcasData, proveedoresData]) => {
        setLugares(lugaresData || []);
        setMarcas(marcasData || []);
        setProveedores(proveedoresData || []);
      }).catch((err) => {
        console.warn("Carga en segundo plano de datos auxiliares:", err);
      });
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar listas de selección");
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

      const celularesActualizados = await lineaService.getCelulares();
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
                      const isBaja = cel.estado_operativo === 'BAJA' || cel.estado_operativo === 'DESHABILITADO';
                      const isOcupado = !cel.disponible_para_linea && !isBaja;
                      const lineasTexto = cel.lineas_asignadas && cel.lineas_asignadas.length > 0
                        ? `(Líneas: ${cel.lineas_asignadas.map((l) => `#${l.numero}`).join(', ')})`
                        : '';

                      if (isBaja) {
                        return (
                          <option key={cel.id} value={cel.id} disabled className="text-gray-400">
                            [{cel.codigo}] {cel.nombre} — {cel.modelo} [NO DISPONIBLE / {cel.estado_operativo}]
                          </option>
                        );
                      }

                      if (isOcupado) {
                        return (
                          <option key={cel.id} value={cel.id} disabled className="text-gray-400">
                            [{cel.codigo}] {cel.nombre} — {cel.modelo} (IMEI 1: {cel.imei_1 || 'N/A'}) — [OCUPADO ${cel.max_lineas === 2 ? '2/2 Dual SIM' : '1/1'} {lineasTexto}]
                          </option>
                        );
                      }

                      return (
                        <option key={cel.id} value={cel.id}>
                          [{cel.codigo}] {cel.nombre} — {cel.modelo} (IMEI 1: {cel.imei_1 || 'S/I'}{cel.imei_2 ? ` | IMEI 2: ${cel.imei_2}` : ''}) {cel.max_lineas === 2 ? `[Dual SIM: ${cel.total_lineas_asignadas || 0}/2]` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="mt-1 text-[10px] text-body-color dark:text-gray-400">
                    Solo los celulares con capacidad disponible (1 línea para Single SIM, hasta 2 líneas para Dual SIM) pueden seleccionarse.
                  </p>
                </div>
              </div>

              {celularSeleccionado && (
                <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-4.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black bg-primary text-white px-2.5 py-1 rounded-lg shadow-sm">
                        {celularSeleccionado.codigo}
                      </span>
                      <h4 className="text-sm font-bold text-black dark:text-white">
                        {celularSeleccionado.nombre}
                      </h4>
                      {celularSeleccionado.modelo && (
                        <span className="text-xs font-semibold text-primary dark:text-primary-light">
                          — {celularSeleccionado.modelo}
                        </span>
                      )}
                      {celularSeleccionado.marca_nombre && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium">
                          Marca: {celularSeleccionado.marca_nombre}
                        </span>
                      )}
                    </div>
                    <div>
                      {celularSeleccionado.max_lineas === 2 ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 text-[11px] font-bold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Dual SIM ({celularSeleccionado.total_lineas_asignadas || 0}/2 líneas ocupadas)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold">
                          Single SIM (1 IMEI)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-1 text-xs">
                    <div className="rounded-xl bg-white/80 dark:bg-black/40 p-2.5 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400">IMEI 1 Principal</p>
                      <p className="font-mono font-bold text-black dark:text-white mt-0.5 tracking-wider">
                        {celularSeleccionado.imei_1 || "No registrado"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/80 dark:bg-black/40 p-2.5 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400">IMEI 2 Secundario</p>
                      <p className="font-mono font-bold text-black dark:text-white mt-0.5 tracking-wider">
                        {celularSeleccionado.imei_2 || "N/A (Single SIM)"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/80 dark:bg-black/40 p-2.5 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Nro. de Serie</p>
                      <p className="font-mono font-semibold text-black dark:text-white mt-0.5">
                        {celularSeleccionado.serie || "S/N"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/80 dark:bg-black/40 p-2.5 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Hardware / Memoria</p>
                      <p className="font-medium text-black dark:text-white mt-0.5">
                        {[celularSeleccionado.memoria, celularSeleccionado.capacidad_disco].filter(Boolean).join(" • ") || "Estándar"}
                      </p>
                    </div>
                  </div>

                  {celularSeleccionado.accesorios && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 italic">
                      Accesorios: {celularSeleccionado.accesorios}
                    </p>
                  )}
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

      {/* MINI MODALES MODULARIZADOS */}
      <ModalCrearEditarPlan
        isOpen={modalNuevoPlan}
        modoEdicion={false}
        telefonias={telefonias}
        formData={datosNuevoPlan}
        setFormData={setDatosNuevoPlan}
        onSubmit={handleCrearPlanSubmit}
        onClose={() => setModalNuevoPlan(false)}
      />

      <ModalCrearEditarPersonal
        isOpen={modalNuevoPersonal}
        modoEdicion={false}
        formData={datosNuevoPersonal}
        setFormData={setDatosNuevoPersonal}
        onSubmit={handleCrearPersonalSubmit}
        onClose={() => setModalNuevoPersonal(false)}
      />

      <ModalCrearCelular
        isOpen={modalNuevoCelular}
        datosNuevoCelular={datosNuevoCelular}
        setDatosNuevoCelular={setDatosNuevoCelular}
        lugares={lugares}
        marcas={marcas}
        proveedores={proveedores}
        onSubmit={handleCrearCelularSubmit}
        onClose={() => setModalNuevoCelular(false)}
      />
    </>
  );
};

export default RegistrarLineaPage;