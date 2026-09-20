"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect, useMemo } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  lineaService,
  Linea,
  Telefonia,
  PlanTelefonia,
  Personal,
  HistorialLinea,
  LineasStats,
  CelularLinea,
  HistorialLineaResponse,
} from "@/services/linea.service";
import { activoService } from "@/services/activo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
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
import {
  LineasStatsCards,
  LineasFilterBar,
  LineasTable,
  generarReporteLineas,
} from "@/components/lineas";

const ListaLineasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  // Estados de datos principales
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

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 250);
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
  const [transferirData, setTransferirData] = useState({ personal_nuevo_id: "", motivo: "" });
  const [cambiarPlanData, setCambiarPlanData] = useState({ plan_nuevo_id: "", motivo: "" });
  const [cambiarEquipoData, setCambiarEquipoData] = useState({ activo_nuevo_id: "", motivo: "" });
  const [bajaData, setBajaData] = useState({ motivo_baja: "", fecha_baja: "" });
  const [edicionData, setEdicionData] = useState({
    numero: "",
    activo_id: "",
    personal_id: "",
    plan_id: "",
    observaciones: "",
  });

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

  const [datosNuevoCelular, setDatosNuevoCelular] = useState({
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
      const [lineasData, telefoniasData, statsData] = await Promise.all([
        lineaService.getAll(),
        lineaService.getTelefonias(),
        lineaService.getStats(),
      ]);

      setLineas(lineasData || []);
      setTelefonias(telefoniasData || []);
      if (statsData) setStats(statsData);
      hideLoading();

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
      plan_id: l.plan_id ? String(l.plan_id) : "",
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
        plan_id: edicionData.plan_id ? parseInt(edicionData.plan_id) : undefined,
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

  const handleCrearPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosNuevoPlan.telefonia_id || !datosNuevoPlan.nombre.trim() || !datosNuevoPlan.costo) {
      toast.error("Campos requeridos", "Por favor completa la telefonía, nombre y costo del plan");
      return;
    }

    showLoading();
    try {
      const nuevoPlan = await lineaService.createPlan({
        telefonia_id: parseInt(datosNuevoPlan.telefonia_id),
        nombre: datosNuevoPlan.nombre.trim(),
        costo: parseFloat(datosNuevoPlan.costo),
        descripcion: datosNuevoPlan.descripcion.trim() || undefined,
      });

      toast.success("Plan creado", "El plan de telefonía ha sido registrado exitosamente");
      setModalNuevoPlan(false);
      setDatosNuevoPlan({ telefonia_id: "", nombre: "", costo: "", descripcion: "" });

      const planesActualizados = await lineaService.getPlanes();
      setPlanes(planesActualizados || []);
      if (nuevoPlan?.id) {
        setCambiarPlanData((prev) => ({ ...prev, plan_nuevo_id: String(nuevoPlan.id) }));
      }
    } catch (err: any) {
      toast.error("Error al crear plan", err.message || "No se pudo registrar el plan");
    } finally {
      hideLoading();
    }
  };

  const handleCrearPersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosNuevoPersonal.nombre.trim() || !datosNuevoPersonal.departamento.trim() || !datosNuevoPersonal.cargo.trim()) {
      toast.error("Campos requeridos", "Por favor completa el nombre, departamento y cargo");
      return;
    }

    showLoading();
    try {
      const nuevoPersonal = await lineaService.createPersonal({
        nombre: datosNuevoPersonal.nombre.trim(),
        departamento: datosNuevoPersonal.departamento.trim(),
        cargo: datosNuevoPersonal.cargo.trim(),
      });

      toast.success("Personal registrado", "El colaborador ha sido registrado exitosamente");
      setModalNuevoPersonal(false);
      setDatosNuevoPersonal({ nombre: "", departamento: "", cargo: "" });

      const personalActualizado = await lineaService.getPersonal();
      setPersonalList(personalActualizado || []);
      if (nuevoPersonal?.id) {
        setTransferirData((prev) => ({ ...prev, personal_nuevo_id: String(nuevoPersonal.id) }));
        setEdicionData((prev) => ({ ...prev, personal_id: String(nuevoPersonal.id) }));
      }
    } catch (err: any) {
      toast.error("Error al registrar personal", err.message || "No se pudo registrar el colaborador");
    } finally {
      hideLoading();
    }
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

  // Filtrado de Líneas (Memoizado y con Debounce)
  const lineasFiltradas = useMemo(() => {
    const q = debouncedBusqueda.trim().toLowerCase();
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
  }, [lineas, debouncedBusqueda, filtroTelefonia, filtroEstado, vistaTab]);

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
          <LineasStatsCards stats={stats} />

          {/* Barra de Filtros, Pestañas y Acciones */}
          <LineasFilterBar
            vistaTab={vistaTab}
            onTabChange={setVistaTab}
            counts={{
              total: lineas.length,
              activas: lineas.filter((l) => l.estado === "ACTIVA").length,
              disponibles: lineas.filter((l) => l.estado === "DISPONIBLE").length,
              bajas: lineas.filter((l) => l.estado === "BAJA").length,
            }}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            filtroTelefonia={filtroTelefonia}
            onTelefoniaChange={setFiltroTelefonia}
            telefonias={telefonias}
            filtroEstado={filtroEstado}
            onEstadoChange={setFiltroEstado}
            onPrint={() => generarReporteLineas(lineasFiltradas)}
          />

          {/* Tabla de Líneas */}
          <LineasTable
            lineas={lineasFiltradas}
            onDetalle={abrirModalDetalle}
            onTransferir={abrirModalTransferir}
            onCambiarPlan={abrirModalCambiarPlan}
            onCambiarEquipo={abrirModalCambiarEquipo}
            onHistorial={abrirModalHistorial}
            onEdicion={abrirModalEdicion}
            onBaja={abrirModalBaja}
          />
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
        planes={planes}
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
