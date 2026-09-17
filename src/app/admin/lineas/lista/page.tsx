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
  CelularLinea,
  HistorialLineaResponse,
} from "@/services/linea.service";
import { activoService } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import {
  ModalDetalleLinea,
  ModalHistorialLinea,
  ModalTransferirLinea,
  ModalCambiarPlanLinea,
  ModalCambiarEquipoLinea,
  ModalDarBajaLinea,
  ModalEdicionLinea,
  ModalCrearEditarPlan,
  ModalCrearEditarPersonal,
  ModalCrearCelular,
} from "@/components/modals";

const ListaLineasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [lineas, setLineas] = useState<Linea[]>([]);
  const [telefonias, setTelefonias] = useState<Telefonia[]>([]);
  const [planes, setPlanes] = useState<PlanTelefonia[]>([]);
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [celulares, setCelulares] = useState<CelularLinea[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
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
  const [modalCambiarEquipo, setModalCambiarEquipo] = useState(false);
  const [modalBaja, setModalBaja] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false);
  const [modalNuevoPersonal, setModalNuevoPersonal] = useState(false);
  const [modalNuevoCelular, setModalNuevoCelular] = useState(false);

  const [lineaSeleccionada, setLineaSeleccionada] = useState<Linea | null>(null);
  const [historialList, setHistorialList] = useState<HistorialLinea[]>([]);
  const [historialDetalle, setHistorialDetalle] = useState<HistorialLineaResponse | null>(null);
  const [tabHistorial, setTabHistorial] = useState<"linea" | "celular">("linea");
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

  const [cambiarEquipoData, setCambiarEquipoData] = useState({
    activo_nuevo_id: "",
    motivo: "",
  });

  const [bajaData, setBajaData] = useState({
    motivo_baja: "",
    fecha_baja: "",
  });

  const [edicionData, setEdicionData] = useState({
    numero: "",
    activo_id: "",
    personal_id: "",
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

  useEffect(() => {
    document.title = "Gestión de Líneas Telefónicas | Activos Greenfield";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      // 1. Carga inmediata de datos principales para renderizado ultra rápido
      const [lineasData, telefoniasData, statsData] = await Promise.all([
        lineaService.getAll(),
        lineaService.getTelefonias(),
        lineaService.getStats(),
      ]);

      setLineas(lineasData || []);
      setTelefonias(telefoniasData || []);
      if (statsData) setStats(statsData);
      hideLoading();

      // 2. Carga secundaria no bloqueante en segundo plano para modales
      Promise.all([
        lineaService.getPlanes(),
        lineaService.getPersonal(),
        lineaService.getCelulares(),
      ]).then(([planesData, personalData, celularesData]) => {
        setPlanes(planesData || []);
        setPersonalList(personalData || []);
        setCelulares(celularesData || []);
      }).catch((err) => {
        console.warn("Carga en segundo plano de datos de modales:", err);
      });
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar las líneas telefónicas");
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

  // Cambiar Equipo Celular
  const abrirModalCambiarEquipo = (l: Linea) => {
    setLineaSeleccionada(l);
    setCambiarEquipoData({
      activo_nuevo_id: l.activo_id ? String(l.activo_id) : "",
      motivo: "",
    });
    setModalCambiarEquipo(true);
  };

  const handleCambiarEquipoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSeleccionada) return;

    if (!cambiarEquipoData.motivo.trim()) {
      toast.error("Campo requerido", "El motivo del cambio de equipo es obligatorio");
      return;
    }

    showLoading();
    try {
      await lineaService.cambiarEquipo(lineaSeleccionada.id, {
        activo_nuevo_id: cambiarEquipoData.activo_nuevo_id ? parseInt(cambiarEquipoData.activo_nuevo_id) : null,
        motivo: cambiarEquipoData.motivo.trim(),
      });

      toast.success("Equipo actualizado", "El equipo celular de la línea ha sido cambiado exitosamente");
      setModalCambiarEquipo(false);
      cargarDatos();
    } catch (err: any) {
      toast.error("Error al cambiar equipo", err.message || "No se pudo cambiar el equipo celular");
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
    setTabHistorial("linea");
    try {
      const data = await lineaService.getHistorial(l.id);
      setHistorialDetalle(data);
      setHistorialList(data.eventos_linea || []);
    } catch (err: any) {
      toast.error("Error al cargar historial", err.message || "No se pudo cargar el historial");
      setHistorialDetalle(null);
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
      activo_id: l.activo_id ? String(l.activo_id) : "",
      personal_id: l.personal_id ? String(l.personal_id) : "",
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
        activo_id: edicionData.activo_id ? parseInt(edicionData.activo_id) : null,
        personal_id: edicionData.personal_id ? parseInt(edicionData.personal_id) : null,
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
        setEdicionData((prev) => ({ ...prev, activo_id: String(nuevoActivo.id) }));
      }
    } catch (err: any) {
      toast.error("Error al registrar celular", err.message || "No se pudo registrar el celular");
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
                <td>${l.celular_codigo ? `[${l.celular_codigo}] ${l.celular_modelo || l.celular_nombre || ''}` : 'Solo Chip'}</td>
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
        l.celular_codigo?.toLowerCase().includes(q) ||
        l.celular_nombre?.toLowerCase().includes(q) ||
        l.celular_modelo?.toLowerCase().includes(q) ||
        l.celular_imei_1?.toLowerCase().includes(q) ||
        l.celular_imei_2?.toLowerCase().includes(q) ||
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
                      Equipo Celular
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
                        <td className="px-5 py-4">
                          {linea.celular_codigo ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-black dark:text-white text-xs flex items-center gap-1.5">
                                <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                  {linea.celular_codigo}
                                </span>
                                {linea.celular_modelo || linea.celular_nombre}
                              </span>
                              {linea.celular_imei_1 && (
                                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                                  IMEI: {linea.celular_imei_1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                              Solo Chip
                            </span>
                          )}
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
                                title="Cambiar Plan de Telefonía"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            )}

                            {/* Cambiar / Reemplazar Equipo Celular */}
                            {linea.estado !== "BAJA" && (
                              <button
                                onClick={() => abrirModalCambiarEquipo(linea)}
                                className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                                title="Cambiar / Reemplazar Equipo Celular"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}

                            {/* Ver Historial */}
                            <button
                              onClick={() => abrirModalHistorial(linea)}
                              className="w-7 h-7 rounded-lg bg-purple-500 hover:bg-purple-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer"
                              title="Historial de Movimientos y Cambios de Equipo"
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

      {/* ================= MODALES MODULARIZADOS ================= */}
      <ModalDetalleLinea
        isOpen={modalDetalle}
        linea={lineaSeleccionada}
        onClose={() => setModalDetalle(false)}
      />

      <ModalTransferirLinea
        isOpen={modalTransferir}
        linea={lineaSeleccionada}
        personalList={personalList}
        transferirData={transferirData}
        setTransferirData={setTransferirData}
        onSubmit={handleTransferirSubmit}
        onClose={() => setModalTransferir(false)}
      />

      <ModalCambiarPlanLinea
        isOpen={modalCambiarPlan}
        linea={lineaSeleccionada}
        planes={planes}
        cambiarPlanData={cambiarPlanData}
        setCambiarPlanData={setCambiarPlanData}
        onSubmit={handleCambiarPlanSubmit}
        onClose={() => setModalCambiarPlan(false)}
      />

      <ModalCambiarEquipoLinea
        isOpen={modalCambiarEquipo}
        linea={lineaSeleccionada}
        celulares={celulares}
        cambiarEquipoData={cambiarEquipoData}
        setCambiarEquipoData={setCambiarEquipoData}
        onSubmit={handleCambiarEquipoSubmit}
        onClose={() => setModalCambiarEquipo(false)}
      />

      <ModalDarBajaLinea
        isOpen={modalBaja}
        linea={lineaSeleccionada}
        bajaData={bajaData}
        setBajaData={setBajaData}
        onSubmit={handleBajaSubmit}
        onClose={() => setModalBaja(false)}
      />

      <ModalHistorialLinea
        isOpen={modalHistorial}
        linea={lineaSeleccionada}
        historialList={historialList}
        historialDetalle={historialDetalle}
        cargandoHistorial={cargandoHistorial}
        tabHistorial={tabHistorial}
        setTabHistorial={setTabHistorial}
        onClose={() => setModalHistorial(false)}
      />

      <ModalEdicionLinea
        isOpen={modalEdicion}
        linea={lineaSeleccionada}
        celulares={celulares}
        personalList={personalList}
        editData={edicionData}
        setEditData={setEdicionData}
        onSubmit={handleEdicionSubmit}
        onClose={() => setModalEdicion(false)}
      />

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

export default ListaLineasPage;
