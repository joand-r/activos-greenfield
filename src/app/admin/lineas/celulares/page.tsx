"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import {
  lineaService,
  CelularLinea,
  EstadoOperativoCelular,
  getColorEstadoCelular,
  getNombreEstadoCelular,
  Telefonia,
} from "@/services/linea.service";
import { marcaService, Marca } from "@/services/marca.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { useToast } from "@/contexts/ToastContext";

const CelularesLineasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [celulares, setCelulares] = useState<CelularLinea[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [error, setError] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoOperativoCelular | "">("");
  const [filtroMarca, setFiltroMarca] = useState<number | "">("");
  const [filtroLugar, setFiltroLugar] = useState<number | "">("");
  const [vistaTab, setVistaTab] = useState<"todos" | "disponibles" | "activos" | "bajas">("todos");

  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [modalBaja, setModalBaja] = useState(false);
  const [celularSeleccionado, setCelularSeleccionado] = useState<CelularLinea | null>(null);

  // Estados de formularios
  const [estadoData, setEstadoData] = useState<{
    estado_operativo: EstadoOperativoCelular;
    accesorios: string;
    motivo: string;
  }>({
    estado_operativo: "DISPONIBLE",
    accesorios: "",
    motivo: "",
  });

  const [bajaData, setBajaData] = useState<{
    fecha_baja: string;
    motivo_baja: string;
  }>({
    fecha_baja: new Date().toISOString().split("T")[0],
    motivo_baja: "",
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    document.title = "Celulares Corporativos | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [celularesData, marcasData, lugaresData, telefoniasData] = await Promise.all([
        lineaService.getCelulares(),
        marcaService.getAll(),
        lugarService.getAll(),
        lineaService.getTelefonias(),
      ]);
      setCelulares(celularesData || []);
      setMarcas(marcasData || []);
      setLugares(lugaresData || []);
      setTelefonias(telefoniasData || []);
    } catch (err: any) {
      console.error("Error al cargar datos de celulares:", err);
      setError(err.message || "Error al cargar el inventario de celulares");
    } finally {
      hideLoading();
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = celulares.length;
    const activos = celulares.filter((c) => c.estado_operativo === "ACTIVO").length;
    const disponibles = celulares.filter((c) => c.estado_operativo === "DISPONIBLE").length;
    const bajas = celulares.filter(
      (c) => c.estado_operativo === "BAJA" || c.estado_operativo === "DESHABILITADO"
    ).length;
    return { total, activos, disponibles, bajas };
  }, [celulares]);

  // Filtrado de lista
  const celularesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return (celulares || []).filter((cel) => {
      const cumpleBusqueda =
        !q ||
        cel.codigo?.toLowerCase().includes(q) ||
        cel.nombre?.toLowerCase().includes(q) ||
        cel.modelo?.toLowerCase().includes(q) ||
        cel.marca_nombre?.toLowerCase().includes(q) ||
        cel.serie?.toLowerCase().includes(q) ||
        cel.imei_1?.toLowerCase().includes(q) ||
        cel.imei_2?.toLowerCase().includes(q) ||
        cel.personal_nombre?.toLowerCase().includes(q) ||
        cel.linea_numero?.toLowerCase().includes(q) ||
        cel.lugar_nombre?.toLowerCase().includes(q);

      const cumpleEstado = !filtroEstado || cel.estado_operativo === filtroEstado;
      const cumpleMarca = !filtroMarca || cel.marca_id === filtroMarca;
      const cumpleLugar = !filtroLugar || cel.lugar_id === filtroLugar;

      let cumpleTab = true;
      if (vistaTab === "disponibles") cumpleTab = cel.estado_operativo === "DISPONIBLE";
      else if (vistaTab === "activos") cumpleTab = cel.estado_operativo === "ACTIVO";
      else if (vistaTab === "bajas")
        cumpleTab = cel.estado_operativo === "BAJA" || cel.estado_operativo === "DESHABILITADO";

      return cumpleBusqueda && cumpleEstado && cumpleMarca && cumpleLugar && cumpleTab;
    });
  }, [celulares, busqueda, filtroEstado, filtroMarca, filtroLugar, vistaTab]);

  // Abrir Modal Detalle
  const abrirModalDetalle = (cel: CelularLinea) => {
    setCelularSeleccionado(cel);
    setModalDetalle(true);
  };

  // Abrir Modal Cambiar Estado
  const abrirModalCambiarEstado = (cel: CelularLinea) => {
    setCelularSeleccionado(cel);
    setEstadoData({
      estado_operativo: cel.estado_operativo || "DISPONIBLE",
      accesorios: cel.accesorios || "",
      motivo: "",
    });
    setModalCambiarEstado(true);
  };

  // Abrir Modal Dar de Baja
  const abrirModalBaja = (cel: CelularLinea) => {
    setCelularSeleccionado(cel);
    setBajaData({
      fecha_baja: new Date().toISOString().split("T")[0],
      motivo_baja: "",
    });
    setModalBaja(true);
  };

  // Guardar cambio de estado
  const handleGuardarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celularSeleccionado) return;

    setGuardando(true);
    try {
      await lineaService.updateCelularEstado(celularSeleccionado.id, {
        estado_operativo: estadoData.estado_operativo,
        accesorios: estadoData.accesorios,
        motivo: estadoData.motivo,
      });
      toast.success("Estado actualizado", "El estado operativo del celular se actualizó correctamente");
      setModalCambiarEstado(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error("Error al actualizar estado", err.message || "No se pudo actualizar el estado del celular");
    } finally {
      setGuardando(false);
    }
  };

  // Guardar Baja
  const handleGuardarBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celularSeleccionado) return;

    if (!bajaData.motivo_baja.trim()) {
      toast.error("Campo obligatorio", "Debe ingresar el motivo de la baja");
      return;
    }

    setGuardando(true);
    try {
      await lineaService.darDeBajaCelular(celularSeleccionado.id, {
        motivo_baja: bajaData.motivo_baja,
        fecha_baja: bajaData.fecha_baja,
      });
      toast.success("Celular dado de baja", "El equipo ha sido registrado como dado de baja");
      setModalBaja(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error("Error al dar de baja", err.message || "No se pudo registrar la baja del celular");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Celulares Corporativos"
        description="Inventario de dispositivos móviles, especificaciones de hardware, asignación de líneas telefónicas y control operativo"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Tarjetas KPI de Resumen */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    Total Celulares
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    En Servicio (Activos)
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.activos}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    Disponibles en Stock
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.disponibles}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    Bajas / Deshabilitados
                  </p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.bajas}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-black/5 dark:border-white/10 pb-4">
            <button
              onClick={() => setVistaTab("todos")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaTab === "todos"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5"
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setVistaTab("activos")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaTab === "activos"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5"
              }`}
            >
              En Servicio ({stats.activos})
            </button>
            <button
              onClick={() => setVistaTab("disponibles")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaTab === "disponibles"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5"
              }`}
            >
              Disponibles ({stats.disponibles})
            </button>
            <button
              onClick={() => setVistaTab("bajas")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaTab === "bajas"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5"
              }`}
            >
              De Baja / Deshabilitados ({stats.bajas})
            </button>
          </div>

          {/* Filtros y Acción */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Buscar Celular
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Código, Modelo, IMEI, Serie, Persona..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Estado Operativo
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as EstadoOperativoCelular | "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="DISPONIBLE">Disponible (En Stock)</option>
                  <option value="ACTIVO">En Servicio (Activo)</option>
                  <option value="BAJA">Dado de Baja</option>
                  <option value="DESHABILITADO">Deshabilitado</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Marca
                </label>
                <select
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Ubicación / Lugar
                </label>
                <select
                  value={filtroLugar}
                  onChange={(e) => setFiltroLugar(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todas las ubicaciones</option>
                  {lugares.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Link
                  href="/admin/activos/registrar"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Registrar Celular
                </Link>
              </div>
            </div>
          </div>

          {/* Tabla de Celulares */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Equipo / Código
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Hardware & IMEIs
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Línea Asignada
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Colaborador / Custodio
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Ubicación
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Estado Operativo
                    </th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {celularesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-body-color dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold text-sm">No se encontraron celulares</span>
                          <span className="text-xs text-gray-400">Prueba ajustando los filtros de búsqueda</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    celularesFiltrados.map((cel) => (
                      <tr
                        key={cel.id}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Código & Modelo */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-black dark:text-white">
                                {cel.codigo}
                              </p>
                              <p className="text-[11px] font-semibold text-primary">
                                {cel.marca_nombre ? `${cel.marca_nombre} ` : ""}{cel.modelo}
                              </p>
                              {cel.serie && (
                                <p className="text-[10px] text-gray-400">
                                  S/N: {cel.serie}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Specs & IMEIs */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {(cel.memoria || cel.capacidad_disco) && (
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-black dark:text-white">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono">
                                  {cel.memoria || "-"}/{cel.capacidad_disco || "-"}
                                </span>
                                {cel.procesador && (
                                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                    {cel.procesador}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                              {cel.imei_1 && <div><span className="font-semibold text-gray-400">IMEI 1:</span> {cel.imei_1}</div>}
                              {cel.imei_2 && <div><span className="font-semibold text-gray-400">IMEI 2:</span> {cel.imei_2}</div>}
                              {!cel.imei_1 && !cel.imei_2 && <span className="italic text-gray-400">Sin IMEI registrado</span>}
                            </div>
                          </div>
                        </td>

                        {/* Línea Asignada */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {cel.linea_numero ? (
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{cel.linea_numero}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {cel.telefonia_nombre} {cel.plan_nombre ? `• ${cel.plan_nombre}` : ""}
                              </p>
                              {cel.plan_costo !== undefined && (
                                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Bs. {parseFloat(String(cel.plan_costo)).toFixed(2)} / mes
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                              Sin Línea
                            </span>
                          )}
                        </td>

                        {/* Personal Colaborador */}
                        <td className="px-5 py-4">
                          {cel.personal_nombre ? (
                            <div>
                              <p className="font-bold text-black dark:text-white">
                                {cel.personal_nombre}
                              </p>
                              {cel.personal_cargo && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {cel.personal_cargo}
                                </p>
                              )}
                              {cel.personal_departamento && (
                                <p className="text-[10px] text-indigo-500 font-medium">
                                  {cel.personal_departamento}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">
                              No asignado
                            </span>
                          )}
                        </td>

                        {/* Ubicación */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-black dark:text-white font-medium">
                            {cel.lugar_nombre || "No especificado"}
                          </span>
                        </td>

                        {/* Estado Operativo */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getColorEstadoCelular(
                              cel.estado_operativo
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {getNombreEstadoCelular(cel.estado_operativo)}
                          </span>
                          {cel.estado_operativo === "BAJA" && cel.fecha_baja && (
                            <p className="text-[9px] text-rose-500 mt-1">
                              Baja: {new Date(cel.fecha_baja).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Ver Detalle / Ficha */}
                            <button
                              onClick={() => abrirModalDetalle(cel)}
                              title="Ver Ficha Técnica"
                              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/10 text-gray-600 dark:text-gray-300 hover:text-primary transition-all cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {/* Cambiar Estado */}
                            <button
                              onClick={() => abrirModalCambiarEstado(cel)}
                              title="Cambiar Estado Operativo"
                              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-all cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>

                            {/* Dar de Baja */}
                            {cel.estado_operativo !== "BAJA" && (
                              <button
                                onClick={() => abrirModalBaja(cel)}
                                title="Dar de Baja"
                                className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-gray-600 dark:text-gray-300 hover:text-rose-600 transition-all cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
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

      {/* ================= MODAL DETALLE / FICHA TÉCNICA ================= */}
      {modalDetalle && celularSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Ficha Técnica del Celular
                  </h3>
                  <p className="text-xs text-gray-500">
                    {celularSeleccionado.codigo} • {celularSeleccionado.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalle(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 text-xs text-black dark:text-white max-h-[70vh] overflow-y-auto pr-1">
              {/* Cabecera del Equipo */}
              <div className="flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 p-4 border border-black/5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-bold text-xl">
                    📱
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white">
                      {celularSeleccionado.codigo} - {celularSeleccionado.nombre}
                    </h4>
                    <p className="text-xs text-primary font-semibold">
                      {celularSeleccionado.marca_nombre} {celularSeleccionado.modelo}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getColorEstadoCelular(
                    celularSeleccionado.estado_operativo
                  )}`}
                >
                  {getNombreEstadoCelular(celularSeleccionado.estado_operativo)}
                </span>
              </div>

              {/* Hardware & IMEIs */}
              <div>
                <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
                  Especificaciones de Hardware
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Número de Serie</span>
                    <span className="font-bold">{celularSeleccionado.serie || "No especificado"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Memoria RAM</span>
                    <span className="font-bold">{celularSeleccionado.memoria || "No especificada"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Almacenamiento</span>
                    <span className="font-bold">{celularSeleccionado.capacidad_disco || "No especificado"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Procesador</span>
                    <span className="font-bold">{celularSeleccionado.procesador || "No especificado"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">IMEI 1</span>
                    <span className="font-mono font-bold">{celularSeleccionado.imei_1 || "No registrado"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">IMEI 2</span>
                    <span className="font-mono font-bold">{celularSeleccionado.imei_2 || "No registrado"}</span>
                  </div>
                </div>
              </div>

              {/* Accesorios */}
              {celularSeleccionado.accesorios && (
                <div>
                  <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
                    Accesorios Incluidos
                  </h5>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <p className="text-xs">{celularSeleccionado.accesorios}</p>
                  </div>
                </div>
              )}

              {/* Asignación Actual */}
              <div>
                <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
                  Línea y Custodia
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Línea Telefónica Enlazada</span>
                    {celularSeleccionado.linea_numero ? (
                      <div>
                        <p className="font-bold text-sm text-primary">{celularSeleccionado.linea_numero}</p>
                        <p className="text-[11px] text-gray-500">
                          {celularSeleccionado.telefonia_nombre} • {celularSeleccionado.plan_nombre}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sin línea telefónica asociada</span>
                    )}
                  </div>

                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Colaborador Asignado</span>
                    {celularSeleccionado.personal_nombre ? (
                      <div>
                        <p className="font-bold text-sm">{celularSeleccionado.personal_nombre}</p>
                        <p className="text-[11px] text-gray-500">
                          {celularSeleccionado.personal_cargo} ({celularSeleccionado.personal_departamento})
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sin custodio asignado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Adquisición y Ubicación */}
              <div>
                <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
                  Adquisición y Ubicación
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Ubicación / Lugar</span>
                    <span className="font-bold">{celularSeleccionado.lugar_nombre || "No especificado"}</span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Fecha Adquisición</span>
                    <span className="font-bold">
                      {celularSeleccionado.fecha_adquision
                        ? new Date(celularSeleccionado.fecha_adquision).toLocaleDateString()
                        : "No registrada"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                    <span className="text-[10px] text-gray-400 block">Costo Adquisición</span>
                    <span className="font-bold">
                      {celularSeleccionado.costo_adquision !== undefined
                        ? `Bs. ${parseFloat(String(celularSeleccionado.costo_adquision)).toFixed(2)}`
                        : "No registrado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Baja (si aplica) */}
              {celularSeleccionado.estado_operativo === "BAJA" && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4">
                  <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-1 uppercase tracking-wider text-[10px]">
                    Información de Baja
                  </h5>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mb-1">
                    <strong>Fecha de Baja:</strong>{" "}
                    {celularSeleccionado.fecha_baja
                      ? new Date(celularSeleccionado.fecha_baja).toLocaleDateString()
                      : "No especificada"}
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-400">
                    <strong>Motivo:</strong> {celularSeleccionado.motivo_baja || "No especificado"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CAMBIAR ESTADO OPERATIVO ================= */}
      {modalCambiarEstado && celularSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Cambiar Estado Operativo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Actualizar estado técnico y administrativo del celular
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCambiarEstado(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGuardarEstado} className="space-y-4 text-xs">
              <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3.5 border border-black/5 dark:border-white/10">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Equipo Seleccionado</p>
                <p className="font-bold text-sm text-black dark:text-white">
                  {celularSeleccionado.codigo} - {celularSeleccionado.marca_nombre} {celularSeleccionado.modelo}
                </p>
                {celularSeleccionado.serie && (
                  <p className="text-[11px] text-gray-500">Serie: {celularSeleccionado.serie}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-2">
                  Nuevo Estado Operativo <span className="text-red-500">*</span>
                </label>
                <select
                  value={estadoData.estado_operativo}
                  onChange={(e) =>
                    setEstadoData({ ...estadoData, estado_operativo: e.target.value as EstadoOperativoCelular })
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  required
                >
                  <option value="DISPONIBLE">Disponible (En Stock para Asignar)</option>
                  <option value="ACTIVO">En Servicio (Activo con Línea/Personal)</option>
                  <option value="BAJA">Dado de Baja</option>
                  <option value="DESHABILITADO">Deshabilitado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-2">
                  Accesorios y Equipamiento
                </label>
                <input
                  type="text"
                  value={estadoData.accesorios}
                  onChange={(e) => setEstadoData({ ...estadoData, accesorios: e.target.value })}
                  placeholder="Ej: Cargador original, funda protectora, cable..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-2">
                  Motivo / Observaciones del Cambio
                </label>
                <textarea
                  rows={3}
                  value={estadoData.motivo}
                  onChange={(e) => setEstadoData({ ...estadoData, motivo: e.target.value })}
                  placeholder="Explica el motivo del cambio de estado operativo..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCambiarEstado(false)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Actualizar Estado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DAR DE BAJA ================= */}
      {modalBaja && celularSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Dar de Baja Celular
                  </h3>
                  <p className="text-xs text-gray-500">
                    Desincorporación técnica y retiro del inventario
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalBaja(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGuardarBaja} className="space-y-4 text-xs">
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4">
                <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                  ¿Estás seguro de dar de baja este equipo celular?
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  Esta acción marcará el celular como dado de baja en el inventario. El equipo pasará a estado inactivo.
                </p>
                {celularSeleccionado.linea_numero && (
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-2">
                    ⚠️ Atención: Este celular está actualmente asociado a la línea telefónica {celularSeleccionado.linea_numero}.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3.5 border border-black/5 dark:border-white/10">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Detalle del Equipo</p>
                <p className="font-bold text-sm text-black dark:text-white">
                  {celularSeleccionado.codigo} - {celularSeleccionado.marca_nombre} {celularSeleccionado.modelo}
                </p>
                {celularSeleccionado.serie && (
                  <p className="text-[11px] text-gray-500">Serie: {celularSeleccionado.serie}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-2">
                  Fecha de Baja <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={bajaData.fecha_baja}
                  onChange={(e) => setBajaData({ ...bajaData, fecha_baja: e.target.value })}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-2">
                  Motivo de la Baja <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={bajaData.motivo_baja}
                  onChange={(e) => setBajaData({ ...bajaData, motivo_baja: e.target.value })}
                  placeholder="Detalla el motivo de la baja (ej. daño irreparable, extravío, obsolescencia técnica)..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalBaja(false)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {guardando ? "Procesando..." : "Confirmar Baja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CelularesLineasPage;
