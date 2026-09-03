"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import {
  lineaService,
  Linea,
  Telefonia,
  PlanTelefonia,
  Personal,
  HistorialLinea,
  EstadoLinea,
  LineasStats,
  getColorEstadoLinea,
  getNombreEstadoLinea,
} from "@/services/linea.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";

const ListaLineasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [lineas, setLineas] = useState<Linea[]>([]);
  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [stats, setStats] = useState<LineasStats>({
    total_lineas: 0,
    lineas_activas: 0,
    lineas_bajas: 0,
    lineas_disponibles: 0,
    costo_mensual_total: 0,
    total_personal_con_lineas: 0,
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtroTelefonia, setFiltroTelefonia] = useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [vistaTab, setVistaTab] = useState<"todas" | "activas" | "disponibles" | "bajas">("todas");
  const [error, setError] = useState("");

  // Modales
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalCambiarPlan, setModalCambiarPlan] = useState(false);
  const [modalBaja, setModalBaja] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false);
  const [modalNuevoPersonal, setModalNuevoPersonal] = useState(false);

  const [lineaSeleccionada, setLineaSeleccionada] = useState<Linea | null>(null);
  const [historialList, setHistorialList] = useState<HistorialLinea[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estados de formularios modales
  const [transferirData, setTransferirData] = useState({
    personal_nuevo_id: "",
    motivo: "",
  });

  const [cambiarPlanData, setCambiarPlanData] = useState({
    plan_nuevo_id: "",
    motivo: "",
  });

  const [bajaData, setBajaData] = useState({
    motivo_baja: "",
    fecha_baja: "",
  });

  const [edicionData, setEdicionData] = useState({
    numero: "",
    equipo_asignado: "",
    observaciones: "",
  });

  // Estados formularios rápidos
  const [datosNuevoPlan, setDatosNuevoPlan] = useState({
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

  useEffect(() => {
    document.title = "Gestión de Líneas Telefónicas | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [lineasData, telefoniasData, planesData, personalData, statsData] = await Promise.all([
        lineaService.getAll(),
        lineaService.getTelefonias(),
        lineaService.getPlanes(),
        lineaService.getPersonal(),
        lineaService.getStats(),
      ]);

      setLineas(lineasData || []);
      setTelefonias(telefoniasData || []);
      setPlanes(planesData || []);
      setPersonalList(personalData || []);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar las líneas telefónicas");
    } finally {
      hideLoading();
    }
  };

  // Ver Detalle
  const abrirModalDetalle = (l: Linea) => {
    setLineaSeleccionada(l);
    setModalDetalle(true);
  };

  // Transferir
  const abrirModalTransferir = (l: Linea) => {
    setLineaSeleccionada(l);
    setTransferirData({
      personal_nuevo_id: "",
      motivo: "Reasignación de funciones",
    });
    setModalTransferir(true);
  };

  const handleTransferirSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSeleccionada || !transferirData.personal_nuevo_id) {
      toast.error("Campo requerido", "Por favor selecciona el nuevo colaborador");
      return;
    }

    showLoading();
    try {
      await lineaService.transferir(lineaSeleccionada.id, {
        personal_nuevo_id: parseInt(transferirData.personal_nuevo_id),
        motivo: transferirData.motivo.trim() || undefined,
      });

      toast.success("Línea transferida", "La línea ha sido reasignada al nuevo colaborador");
      setModalTransferir(false);
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al transferir", err.message || "No se pudo transferir la línea");
    } finally {
      hideLoading();
    }
  };

  // Cambiar Plan
  const abrirModalCambiarPlan = (l: Linea) => {
    setLineaSeleccionada(l);
    setCambiarPlanData({
      plan_nuevo_id: String(l.plan_id),
      motivo: "Actualización de paquete corporativo",
    });
    setModalCambiarPlan(true);
  };

  const handleCambiarPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSeleccionada || !cambiarPlanData.plan_nuevo_id) {
      toast.error("Campo requerido", "Por favor selecciona el nuevo plan");
      return;
    }

    showLoading();
    try {
      await lineaService.cambiarPlan(lineaSeleccionada.id, {
        plan_nuevo_id: parseInt(cambiarPlanData.plan_nuevo_id),
        motivo: cambiarPlanData.motivo.trim() || undefined,
      });

      toast.success("Plan actualizado", "El plan de la línea ha sido modificado exitosamente");
      setModalCambiarPlan(false);
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al cambiar plan", err.message || "No se pudo cambiar el plan");
    } finally {
      hideLoading();
    }
  };

  // Dar de Baja
  const abrirModalBaja = (l: Linea) => {
    setLineaSeleccionada(l);
    setBajaData({
      motivo_baja: "",
      fecha_baja: new Date().toISOString().split("T")[0],
    });
    setModalBaja(true);
  };

  const handleBajaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSeleccionada || !bajaData.motivo_baja.trim()) {
      toast.error("Campo requerido", "El motivo de la baja es obligatorio");
      return;
    }

    showLoading();
    try {
      await lineaService.darDeBaja(lineaSeleccionada.id, {
        motivo_baja: bajaData.motivo_baja.trim(),
        fecha_baja: bajaData.fecha_baja || undefined,
      });

      toast.success("Línea dada de baja", "La línea ha sido marcada como de baja");
      setModalBaja(false);
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al dar de baja", err.message || "No se pudo dar de baja la línea");
    } finally {
      hideLoading();
    }
  };

  // Historial
  const abrirModalHistorial = async (l: Linea) => {
    setLineaSeleccionada(l);
    setModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const data = await lineaService.getHistorial(l.id);
      setHistorialList(data || []);
    } catch (err: any) {
      toast.error("Error al cargar historial", err.message || "No se pudo cargar el historial");
      setHistorialList([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Edición General
  const abrirModalEdicion = (l: Linea) => {
    setLineaSeleccionada(l);
    setEdicionData({
      numero: l.numero,
      equipo_asignado: l.equipo_asignado || "",
      observaciones: l.observaciones || "",
    });
    setModalEdicion(true);
  };

  const handleEdicionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSeleccionada || !edicionData.numero.trim()) {
      toast.error("Campo requerido", "El número es obligatorio");
      return;
    }

    showLoading();
    try {
      await lineaService.update(lineaSeleccionada.id, {
        numero: edicionData.numero.trim(),
        equipo_asignado: edicionData.equipo_asignado.trim() || undefined,
        observaciones: edicionData.observaciones.trim() || undefined,
      });

      toast.success("Línea actualizada", "Los datos de la línea han sido actualizados");
      setModalEdicion(false);
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al actualizar", err.message || "No se pudo actualizar la línea");
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

      toast.success("Plan creado", "El plan ha sido registrado exitosamente");
      setModalNuevoPlan(false);

      const planesActualizados = await lineaService.getPlanes();
      setPlanes(planesActualizados || []);
      if (nuevo?.id) {
        setCambiarPlanData((prev) => ({ ...prev, plan_nuevo_id: String(nuevo.id) }));
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

      toast.success("Personal registrado", "El colaborador ha sido registrado exitosamente");
      setModalNuevoPersonal(false);

      const personalActualizado = await lineaService.getPersonal();
      setPersonalList(personalActualizado || []);
      if (nuevo?.id) {
        setTransferirData((prev) => ({ ...prev, personal_nuevo_id: String(nuevo.id) }));
      }
    } catch (err: any) {
      toast.error("Error al registrar", err.message || "No se pudo registrar el personal");
    } finally {
      hideLoading();
    }
  };

  // Generar Reporte Imprimible
  const generarReporteLineas = () => {
    const ventana = window.open("", "_blank");
    if (!ventana) return;

    const lineasActivas = lineas.filter((l) => l.estado === "ACTIVA");
    const costoTotalActivas = lineasActivas.reduce(
      (acc, l) => acc + parseFloat(String(l.plan_costo || 0)),
      0
    );

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte General - Líneas Telefónicas</title>
        <style>
          @page { size: letter landscape; margin: 1.2cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; line-height: 1.4; }
          .header { border-bottom: 3px solid #333; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 18px; font-weight: bold; color: #333; }
          .title { font-size: 14px; color: #555; margin-top: 4px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 15px; }
          .stat-card { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
          .stat-number { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 4px; }
          .stat-label { font-size: 9px; color: #666; text-transform: uppercase; }
          .section-title { font-size: 12px; font-weight: bold; margin: 15px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px; }
          th, td { padding: 6px 8px; text-align: left; border: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
          .badge-activa { background: #dcfce7; color: #15803d; }
          .badge-disponible { background: #e0f2fe; color: #0369a1; }
          .badge-baja { background: #fee2e2; color: #b91c1c; }
          .badge-suspendida { background: #fef3c7; color: #d97706; }
          .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 8px; }
          @media print { body { padding: 5px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ACTIVOS GREENFIELD</div>
            <div class="title">Inventario y Control de Líneas Telefónicas Corporativas</div>
          </div>
          <div style="text-align: right; font-size: 9px; color: #666;">
            <div>Fecha: ${new Date().toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div>Hora: ${new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${lineas.length}</div>
            <div class="stat-label">Total Líneas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${lineasActivas.length}</div>
            <div class="stat-label">Líneas Activas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${lineas.filter((l) => l.estado === "BAJA").length}</div>
            <div class="stat-label">Líneas de Baja</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">Bs. ${costoTotalActivas.toFixed(2)}</div>
            <div class="stat-label">Costo Mensual Total</div>
          </div>
        </div>

        <div class="section-title">Listado Completo de Líneas</div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">Número</th>
              <th style="width: 22%;">Colaborador Asignado</th>
              <th style="width: 16%;">Departamento / Cargo</th>
              <th style="width: 10%;">Telefonía</th>
              <th style="width: 15%;">Plan Contratado</th>
              <th style="width: 10%; text-align: right;">Costo (Bs.)</th>
              <th style="width: 15%;">Equipo Asignado</th>
              <th style="width: 8%; text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${lineas
              .map(
                (l) => `
              <tr>
                <td style="font-family: monospace; font-weight: bold;">${l.numero}</td>
                <td>${l.personal_nombre || '<span style="color: #888;">Sin asignar</span>'}</td>
                <td>${l.personal_departamento ? l.personal_departamento + ' - ' + l.personal_cargo : 'N/A'}</td>
                <td style="font-weight: bold;">${l.telefonia_nombre || 'N/A'}</td>
                <td>${l.plan_nombre || 'N/A'}</td>
                <td style="text-align: right; font-weight: bold;">Bs. ${parseFloat(String(l.plan_costo || 0)).toFixed(2)}</td>
                <td>${l.equipo_asignado || 'Solo Chip'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-${(l.estado || 'disponible').toLowerCase()}">
                    ${getNombreEstadoLinea(l.estado)}
                  </span>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Activos Greenfield - Sistema de Gestión de Líneas Telefónicas</p>
          <p>Documento confidencial para control administrativo interno</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  // Filtrado de Líneas (Memoizado para alto rendimiento)
  const lineasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const telId = filtroTelefonia ? Number(filtroTelefonia) : null;

    return (lineas || []).filter((l) => {
      const cumpleBusqueda =
        !q ||
        l.numero?.toLowerCase().includes(q) ||
        l.personal_nombre?.toLowerCase().includes(q) ||
        l.personal_departamento?.toLowerCase().includes(q) ||
        l.personal_cargo?.toLowerCase().includes(q) ||
        l.equipo_asignado?.toLowerCase().includes(q) ||
        l.plan_nombre?.toLowerCase().includes(q);

      const cumpleTelefonia = !telId || l.telefonia_id === telId;
      const cumpleEstado = !filtroEstado || l.estado === filtroEstado;

      let cumpleTab = true;
      if (vistaTab === "activas") cumpleTab = l.estado === "ACTIVA";
      else if (vistaTab === "disponibles") cumpleTab = l.estado === "DISPONIBLE";
      else if (vistaTab === "bajas") cumpleTab = l.estado === "BAJA";

      return cumpleBusqueda && cumpleTelefonia && cumpleEstado && cumpleTab;
    });
  }, [lineas, busqueda, filtroTelefonia, filtroEstado, vistaTab]);

  return (
    <>
      <Breadcrumb
        pageName="Líneas Telefónicas"
        description="Gestión integral de líneas corporativas, asignación de equipos, planes tarifarios y control de costos"
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
                    Total Líneas
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">{stats.total_lineas}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    Costo Mensual Total
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Bs. {parseFloat(String(stats.costo_mensual_total || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">
                    Líneas Activas
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.lineas_activas}</p>
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
                    Colaboradores con Línea
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total_personal_con_lineas}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Vistas Tabs */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVistaTab("todas")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  vistaTab === "todas"
                    ? "bg-primary text-white shadow-md"
                    : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
                }`}
              >
                Todas ({lineas.length})
              </button>
              <button
                onClick={() => setVistaTab("activas")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  vistaTab === "activas"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
                }`}
              >
                Activas ({lineas.filter((l) => l.estado === "ACTIVA").length})
              </button>
              <button
                onClick={() => setVistaTab("disponibles")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  vistaTab === "disponibles"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
                }`}
              >
                Disponibles / Stock ({lineas.filter((l) => l.estado === "DISPONIBLE").length})
              </button>
              <button
                onClick={() => setVistaTab("bajas")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  vistaTab === "bajas"
                    ? "bg-rose-600 text-white shadow-md"
                    : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
                }`}
              >
                De Baja ({lineas.filter((l) => l.estado === "BAJA").length})
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generarReporteLineas}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Reporte
              </button>
              <Link
                href="/admin/lineas/registrar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Línea
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Buscar por número, persona o equipo
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: 70123456, Daniela, iPhone..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black dark:text-white">
                  Filtrar por Telefonía
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
                  Filtrar por Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="DISPONIBLE">Disponible (Stock)</option>
                  <option value="SUSPENDIDA">Suspendida</option>
                  <option value="BAJA">De Baja</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Líneas */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Número
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Personal Asignado
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Telefonía
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Plan (Tarifa Mensual)
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Equipo Asignado
                    </th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {lineasFiltradas.length > 0 ? (
                    lineasFiltradas.map((linea) => (
                      <tr
                        key={linea.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-black dark:text-white text-sm">
                          {linea.numero}
                        </td>
                        <td className="px-5 py-4">
                          {linea.personal_nombre ? (
                            <div>
                              <p className="font-bold text-black dark:text-white text-sm">
                                {linea.personal_nombre}
                              </p>
                              <p className="text-[10px] text-body-color dark:text-gray-400 mt-0.5">
                                {linea.personal_cargo} • {linea.personal_departamento}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              Disponible en Stock
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-primary">
                          <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            {linea.telefonia_nombre || "N/A"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-black dark:text-white">
                            {linea.plan_nombre || "N/A"}
                          </p>
                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                            Bs. {parseFloat(String(linea.plan_costo || 0)).toFixed(2)}/mes
                          </p>
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                          {linea.equipo_asignado || "Solo Chip"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${getColorEstadoLinea(
                              linea.estado
                            )}`}
                          >
                            {getNombreEstadoLinea(linea.estado)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver Detalle */}
                            <button
                              onClick={() => abrirModalDetalle(linea)}
                              className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                              title="Ver Detalle"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {/* Transferir a otro personal */}
                            {linea.estado !== "BAJA" && (
                              <button
                                onClick={() => abrirModalTransferir(linea)}
                                className="w-7 h-7 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                                title="Transferir / Reasignar a otro personal"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            )}

                            {/* Cambiar Plan */}
                            {linea.estado !== "BAJA" && (
                              <button
                                onClick={() => abrirModalCambiarPlan(linea)}
                                className="w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                                title="Cambiar Plan Tarifario"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </button>
                            )}

                            {/* Ver Historial */}
                            <button
                              onClick={() => abrirModalHistorial(linea)}
                              className="w-7 h-7 rounded-lg bg-purple-500 hover:bg-purple-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                              title="Historial de Movimientos"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>

                            {/* Editar */}
                            {linea.estado !== "BAJA" && (
                              <button
                                onClick={() => abrirModalEdicion(linea)}
                                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                                title="Editar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}

                            {/* Dar de Baja */}
                            {linea.estado !== "BAJA" && (
                              <button
                                onClick={() => abrirModalBaja(linea)}
                                className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                                title="Dar de Baja"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron líneas telefónicas con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DETALLE DE LÍNEA */}
      {modalDetalle && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                <span>Línea Telefónica #{lineaSeleccionada.numero}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getColorEstadoLinea(lineaSeleccionada.estado)}`}>
                  {getNombreEstadoLinea(lineaSeleccionada.estado)}
                </span>
              </h3>
              <button onClick={() => setModalDetalle(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Colaborador Asignado</h4>
                {lineaSeleccionada.personal_nombre ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500">Nombre:</p>
                      <p className="font-bold text-black dark:text-white">{lineaSeleccionada.personal_nombre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cargo / Depto:</p>
                      <p className="font-medium text-black dark:text-white">
                        {lineaSeleccionada.personal_cargo} • {lineaSeleccionada.personal_departamento}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Actualmente sin colaborador asignado (Línea disponible en Stock).</p>
                )}
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Plan y Tarifa</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-gray-500">Operadora:</p>
                    <p className="font-bold text-black dark:text-white">{lineaSeleccionada.telefonia_nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Plan:</p>
                    <p className="font-bold text-black dark:text-white">{lineaSeleccionada.plan_nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Costo Mensual:</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      Bs. {parseFloat(String(lineaSeleccionada.plan_costo || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Equipo y Fechas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">Equipo Asignado:</p>
                    <p className="font-bold text-black dark:text-white">{lineaSeleccionada.equipo_asignado || "Solo Chip"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha Asignación:</p>
                    <p className="font-medium text-black dark:text-white">{lineaSeleccionada.fecha_asignacion || "N/A"}</p>
                  </div>
                </div>

                {lineaSeleccionada.estado === "BAJA" && (
                  <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/50">
                    <p className="text-red-600 font-bold text-[10px] uppercase">Datos de Baja</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                      <strong>Fecha de Baja:</strong> {lineaSeleccionada.fecha_baja || "N/A"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                      <strong>Motivo:</strong> {lineaSeleccionada.motivo_baja || "No especificado"}
                    </p>
                  </div>
                )}
              </div>

              {lineaSeleccionada.observaciones && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <p className="text-gray-500 font-bold">Observaciones:</p>
                  <p className="text-black dark:text-white mt-0.5">{lineaSeleccionada.observaciones}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setModalDetalle(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSFERIR A OTRO PERSONAL */}
      {modalTransferir && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Transferir Línea #{lineaSeleccionada.numero}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mb-4">
              Asigna esta línea telefónica a otro colaborador y registra el motivo en la bitácora histórica.
            </p>
            <form onSubmit={handleTransferirSubmit} className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Colaborador Actual</p>
                <p className="text-sm font-bold text-black dark:text-white">
                  {lineaSeleccionada.personal_nombre || "Sin Asignar (En Stock)"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-black dark:text-white">
                    Nuevo Colaborador Responsable <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={abrirModalNuevoPersonal}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Personal
                  </button>
                </div>
                <select
                  value={transferirData.personal_nuevo_id}
                  onChange={(e) => setTransferirData({ ...transferirData, personal_nuevo_id: e.target.value })}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Seleccionar Nuevo Colaborador --</option>
                  {personalList
                    .filter((p) => p.id !== lineaSeleccionada.personal_id && p.estado === "ACTIVO")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {p.cargo} ({p.departamento})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Motivo de la Transferencia
                </label>
                <textarea
                  rows={2}
                  value={transferirData.motivo}
                  onChange={(e) => setTransferirData({ ...transferirData, motivo: e.target.value })}
                  placeholder="Ej: Cambio de puesto, reasignación de chip..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalTransferir(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Confirmar Transferencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR PLAN */}
      {modalCambiarPlan && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Cambiar Plan de Línea #{lineaSeleccionada.numero}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mb-4">
              Selecciona el nuevo plan tarifario contratado para esta línea.
            </p>
            <form onSubmit={handleCambiarPlanSubmit} className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Plan Actual</p>
                <p className="text-sm font-bold text-black dark:text-white">
                  [{lineaSeleccionada.telefonia_nombre}] {lineaSeleccionada.plan_nombre} (Bs. {parseFloat(String(lineaSeleccionada.plan_costo || 0)).toFixed(2)}/mes)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-black dark:text-white">
                    Nuevo Plan <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={abrirModalNuevoPlan}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Plan
                  </button>
                </div>
                <select
                  value={cambiarPlanData.plan_nuevo_id}
                  onChange={(e) => setCambiarPlanData({ ...cambiarPlanData, plan_nuevo_id: e.target.value })}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Seleccionar Nuevo Plan --</option>
                  {telefonias.map((tel) => {
                    const planesDeTel = planes.filter((p) => p.telefonia_id === tel.id && p.estado === "DISPONIBLE");
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
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Motivo del Cambio de Plan
                </label>
                <textarea
                  rows={2}
                  value={cambiarPlanData.motivo}
                  onChange={(e) => setCambiarPlanData({ ...cambiarPlanData, motivo: e.target.value })}
                  placeholder="Ej: Aumento de cupo de internet, cambio de tarifa corporativa..."
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalCambiarPlan(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-all cursor-pointer"
                >
                  Guardar Cambio de Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DAR DE BAJA */}
      {modalBaja && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-2">
              Dar de Baja Línea #{lineaSeleccionada.numero}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mb-4">
              Esta acción marcará la línea como inactiva/de baja y registrará el motivo en el historial.
            </p>
            <form onSubmit={handleBajaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Fecha de Baja
                </label>
                <input
                  type="date"
                  value={bajaData.fecha_baja}
                  onChange={(e) => setBajaData({ ...bajaData, fecha_baja: e.target.value })}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Motivo de la Baja <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={bajaData.motivo_baja}
                  onChange={(e) => setBajaData({ ...bajaData, motivo_baja: e.target.value })}
                  placeholder="Ej: Fin de contrato comercial, robo/extravío del chip, cancelación por desuso..."
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalBaja(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-all cursor-pointer"
                >
                  Confirmar Baja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE MOVIMIENTOS */}
      {modalHistorial && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                Historial de Movimientos — Línea #{lineaSeleccionada.numero}
              </h3>
              <button onClick={() => setModalHistorial(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cargandoHistorial ? (
              <div className="py-12 text-center text-primary font-bold">Cargando eventos...</div>
            ) : historialList.length > 0 ? (
              <div className="relative border-l-2 border-primary/30 ml-4 space-y-6 my-4">
                {historialList.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-white dark:ring-gray-dark" />
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/40 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase">{item.tipo_evento}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(item.fecha).toLocaleString("es-BO")}
                        </span>
                      </div>

                      {item.tipo_evento === "TRANSFERENCIA" && (
                        <p className="text-xs font-medium text-black dark:text-white mt-1">
                          Traspaso de: <strong>{item.personal_anterior_nombre || "Stock"}</strong> ➔{" "}
                          <strong>{item.personal_nuevo_nombre}</strong>
                        </p>
                      )}

                      {item.tipo_evento === "CAMBIO_PLAN" && (
                        <p className="text-xs font-medium text-black dark:text-white mt-1">
                          Cambio de Plan: <strong>{item.plan_anterior_nombre}</strong> ➔{" "}
                          <strong>{item.plan_nuevo_nombre}</strong>
                        </p>
                      )}

                      {item.tipo_evento === "BAJA" && (
                        <p className="text-xs font-bold text-rose-600 mt-1">
                          Línea dada de baja del sistema
                        </p>
                      )}

                      {item.tipo_evento === "ASIGNACION" && (
                        <p className="text-xs font-medium text-black dark:text-white mt-1">
                          Asignada a: <strong>{item.personal_nuevo_nombre || "Stock inicial"}</strong>
                        </p>
                      )}

                      {item.motivo && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 italic mt-1">
                          Motivo: &ldquo;{item.motivo}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No hay registros previos en el historial de esta línea.
              </div>
            )}

            <div className="flex justify-end pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setModalHistorial(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN RÁPIDA */}
      {modalEdicion && lineaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Editar Datos de la Línea
            </h3>
            <form onSubmit={handleEdicionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Número Telefónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={edicionData.numero}
                  onChange={(e) => setEdicionData({ ...edicionData, numero: e.target.value })}
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Equipo Asignado
                </label>
                <input
                  type="text"
                  value={edicionData.equipo_asignado}
                  onChange={(e) => setEdicionData({ ...edicionData, equipo_asignado: e.target.value })}
                  placeholder="Ej: iPhone 13 Pro, Solo Chip"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  value={edicionData.observaciones}
                  onChange={(e) => setEdicionData({ ...edicionData, observaciones: e.target.value })}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalEdicion(false)}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINI MODAL: CREAR PLAN RÁPIDO */}
      {modalNuevoPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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

export default ListaLineasPage;
