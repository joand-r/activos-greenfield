"use client";

import ScrollUp from "@/components/ui/Common/ScrollUp";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { activoService, Activo, getNombreTipoActivo } from "@/services/activo.service";
import { lugarService } from "@/services/lugar.service";

interface Lugar {
  id: number;
  nombre: string;
  tipo: string;
  inicial: string;
  activos?: Activo[];
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalActivos, setTotalActivos] = useState(0);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [activosPorLugar, setActivosPorLugar] = useState<{[key: number]: Activo[]}>({});
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("todos");
  const [activoModal, setActivoModal] = useState<Activo | null>(null);
  const [imagenFullscreen, setImagenFullscreen] = useState(false);

  useEffect(() => {
    document.title = "Activos Greenfield - Sistema de Gestión de Activos";
    cargarDatos();
  }, []);

  // Detectar activo desde parámetro de búsqueda de la URL (Buscador del Sidebar)
  useEffect(() => {
    const checkUrlParam = async () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const codigoParam = urlParams.get("codigo");
        if (codigoParam) {
          try {
            const activos = await activoService.getAll();
            const found = (activos || []).find((act) => act.codigo === codigoParam);
            if (found) {
              setActivoModal(found);
            }
          } catch (err) {
            console.error("Error al cargar activo desde URL:", err);
          }
        }
      }
    };

    checkUrlParam();

    // Escuchar eventos de navegación del navegador
    window.addEventListener("popstate", checkUrlParam);

    // Escuchar cambios a través de intervalo para Next.js routing
    const interval = setInterval(checkUrlParam, 1000);

    return () => {
      window.removeEventListener("popstate", checkUrlParam);
      clearInterval(interval);
    };
  }, []);

  const cargarDatos = async () => {
    try {
      const [lugaresData, activosData] = await Promise.all([
        lugarService.getAll(),
        activoService.getAll()
      ]);
      
      setLugares(lugaresData || []);
      setTotalActivos((activosData || []).length);
      
      // Agrupar activos por lugar
      const activosPorLugarTemp: {[key: number]: Activo[]} = {};
      (lugaresData || []).forEach((lugar: Lugar) => {
        activosPorLugarTemp[lugar.id] = (activosData || []).filter(
          (act: Activo) => act.lugar_id === lugar.id
        );
      });
      
      setActivosPorLugar(activosPorLugarTemp);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLugares([]);
      setTotalActivos(0);
      setActivosPorLugar({});
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const activos = await activoService.getAll();
      const filtered = (activos || []).filter((activo: Activo) => 
        activo.nombre?.toLowerCase().includes(value.toLowerCase()) ||
        activo.codigo?.toLowerCase().includes(value.toLowerCase()) ||
        (activo.descripcion && activo.descripcion.toLowerCase().includes(value.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error al buscar:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivoClick = (activo: Activo) => {
    setActivoModal(activo);
  };

  const getColorEstado = (estado?: string | null) => {
    switch (estado) {
      case 'NUEVO': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'USADO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'DISPONIBLE': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
      case 'DANADO': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case 'VENDIDO': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'DONADO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'TRANSFERIR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const lugaresFiltrados = tipoSeleccionado === "todos" 
    ? (lugares || [])
    : (lugares || []).filter(l => l.tipo === tipoSeleccionado);

  const totalLugares = (lugares || []).length;

  const tiposLugar = [
    { id: "todos", nombre: "Todos", color: "bg-gray-500" },
    { id: "VIVIENDA", nombre: "Vivienda", color: "bg-green-500" },
    { id: "OFICINA", nombre: "Oficina", color: "bg-blue-500" },
    { id: "ALMACEN", nombre: "Almacén", color: "bg-purple-500" },
    { id: "CENTER", nombre: "Center", color: "bg-orange-500" },
    { id: "PROPIEDAD", nombre: "Propiedad", color: "bg-pink-500" },
  ];

  return (
    <>
      <ScrollUp />

      {/* Modal público de detalle de activo */}
      {activoModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setActivoModal(null); }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-dark shadow-2xl overflow-hidden">
            {/* Botón cerrar */}
            <button
              onClick={() => setActivoModal(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/10 dark:bg-white/10 p-2 hover:bg-black/20 dark:hover:bg-white/20 transition"
            >
              <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Imagen superior */}
            <div 
              className={`relative h-64 bg-gray-100 dark:bg-gray-800/80 overflow-hidden ${activoModal.imagen ? 'cursor-zoom-in group' : ''}`}
              onClick={() => { if (activoModal.imagen) setImagenFullscreen(true); }}
              title={activoModal.imagen ? "Clic para ver en pantalla completa" : ""}
            >
              {activoModal.imagen ? (
                <>
                  <Image 
                    src={activoModal.imagen} 
                    alt={activoModal.nombre} 
                    fill 
                    className="object-contain transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Ver pantalla completa
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-20 w-20 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {/* Badge estado sobre la imagen */}
              <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold shadow-sm ${getColorEstado(activoModal.estado)}`}>
                  {activoModal.estado || 'N/A'}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Código + tipo */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                  {activoModal.codigo}
                </span>
                <span className="text-xs text-body-color">
                  {activoModal.tipo_activo ? getNombreTipoActivo(activoModal.tipo_activo) : ''}
                </span>
              </div>

              {/* Nombre */}
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                {activoModal.nombre}
              </h2>

              {/* Ubicación */}
              {activoModal.lugar_nombre && (
                <div className="flex items-center gap-2 mb-4 rounded-lg bg-primary/5 dark:bg-primary/10 px-4 py-3">
                  <svg className="w-4 h-4 text-primary dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-black dark:text-white">{activoModal.lugar_nombre}</span>
                </div>
              )}

              {/* Descripción */}
              {activoModal.descripcion && (
                <p className="text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                  {activoModal.descripcion}
                </p>
              )}

              {/* Fecha adquisición (solo año) */}
              {activoModal.fecha_adquision && (
                <p className="mt-3 text-xs text-gray-400">
                  En uso desde {new Date(activoModal.fecha_adquision).getFullYear()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section con Buscador Principal y Métricas */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-dark dark:via-bg-color-dark dark:to-gray-dark pt-[100px] pb-[60px] md:pt-[120px] md:pb-[80px]">
        {/* Decoración */}
        <div className="absolute top-0 right-0 -z-10 opacity-10 dark:opacity-5">
          <svg width="450" height="556" viewBox="0 0 450 556" fill="none">
            <circle cx="277" cy="63" r="225" fill="url(#paint0_linear_25:217)"/>
            <defs>
              <linearGradient id="paint0_linear_25:217" x1="452.5" y1="63" x2="52" y2="63" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4A6CF7"/>
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[800px] text-center">
                {/* Badge Activos */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                  <span className="text-xs font-semibold text-primary">
                    {totalActivos} Activos Registrados
                  </span>
                </div>

                {/* Título Principal de Diseño Innovador */}
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-black dark:text-white sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
                  Gestión Inteligente
                  <span className="block bg-gradient-to-r from-emerald-500 via-primary to-indigo-600 bg-clip-text text-transparent">
                    de Activos Greenfield
                  </span>
                </h1>

                <p className="mb-8 text-sm text-body-color dark:text-body-color-dark sm:text-base max-w-[600px] mx-auto">
                  Localiza, consulta y administra la infraestructura física de viviendas, almacenes y oficinas con total control en tiempo real.
                </p>

                {/* Tarjetas de Métricas de Diseño Innovador */}
                <div className="grid grid-cols-3 gap-3 mb-8 max-w-[540px] mx-auto">
                  <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-stroke dark:border-strokedark px-3 py-3 rounded-xl shadow-sm flex flex-col items-center hover:scale-105 transition-all duration-300">
                    <span className="text-xl font-black text-primary">{totalActivos}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-body-color dark:text-gray-400">Activos</span>
                  </div>
                  <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-stroke dark:border-strokedark px-3 py-3 rounded-xl shadow-sm flex flex-col items-center hover:scale-105 transition-all duration-300">
                    <span className="text-xl font-black text-primary">{totalLugares}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-body-color dark:text-gray-400">Ubicaciones</span>
                  </div>
                  <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-stroke dark:border-strokedark px-3 py-3 rounded-xl shadow-sm flex flex-col items-center hover:scale-105 transition-all duration-300">
                    <span className="text-xl font-black text-primary">9</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-body-color dark:text-gray-400">Categorías</span>
                  </div>
                </div>

                {/* Buscador Principal */}
                <div className="relative mx-auto max-w-[560px]">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar por código, nombre o descripción..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-5 text-sm font-medium text-black outline-none transition focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] dark:border-gray-700 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />

                    {loading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Búsqueda rápida */}
                  {!searchTerm && (
                    <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs text-body-color">Búsqueda rápida:</span>
                      {["Computadora", "Silla", "Mesa"].map((tag) => (
                        <button 
                          key={tag}
                          onClick={() => handleSearch(tag)}
                          className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Resultados de búsqueda */}
                  {searchTerm && searchResults.length > 0 && (
                    <div className="mt-4 max-h-[400px] overflow-y-auto rounded-xl border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-gray-dark">
                      <div className="p-4">
                        <p className="mb-3 text-left text-xs font-semibold text-body-color">
                          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2">
                          {searchResults.map((activo) => (
                            <div
                              key={activo.id}
                              onClick={() => handleActivoClick(activo)}
                              className="group flex cursor-pointer items-start gap-3 rounded-lg border border-stroke bg-gray-50 dark:bg-gray-900/50 p-3 transition hover:border-primary/50 hover:bg-primary/5 dark:hover:border-primary/50 dark:hover:bg-primary/10 text-left"
                            >
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-800 relative">
                                {activo.imagen ? (
                                  <Image src={activo.imagen} alt={activo.nombre} fill className="object-contain p-0.5" />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-black group-hover:text-primary dark:text-white dark:group-hover:text-primary truncate">
                                  {activo.nombre}
                                </h4>
                                <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                                  {activo.codigo}
                                </p>
                                <p className="text-[9px] text-body-color truncate">
                                  {activo.lugar_nombre || 'Sin ubicación'} • {activo.estado}
                                </p>
                              </div>

                              <div className="flex-shrink-0 self-center">
                                <svg className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sin resultados */}
                  {searchTerm && !loading && searchResults.length === 0 && (
                    <div className="mt-4 rounded-xl border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-gray-dark">
                      <svg className="mx-auto mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-xs text-body-color">
                        No se encontraron activos con &quot;<strong>{searchTerm}</strong>&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Lugares */}
      <section className="py-12 md:py-16 bg-gray-light dark:bg-gray-dark">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-10 max-w-[700px] text-center lg:mb-12">
                <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Activos por Ubicación
                </h2>
                <p className="text-xs text-body-color">
                  Filtra y revisa los activos de cada uno de los almacenes, oficinas y viviendas del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs de tipos */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {tiposLugar.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoSeleccionado(tipo.id)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  tipoSeleccionado === tipo.id
                    ? `${tipo.color} text-white shadow-sm`
                    : "bg-gray-150 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750"
                }`}
              >
                {tipo.nombre}
              </button>
            ))}
          </div>

          {/* Lugares con sus activos */}
          <div className="-mx-4 flex flex-wrap">
            {lugaresFiltrados.map((lugar) => {
              const activos = activosPorLugar[lugar.id] || [];
              
              return (
                <div key={lugar.id} className="w-full px-4 mb-8">
                  <div className="rounded-2xl border bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-md border-stroke dark:border-strokedark p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Header del Lugar */}
                    <div className="mb-5 flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3.5">
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white mb-1 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            lugar.tipo === 'VIVIENDA' ? 'bg-green-500' :
                            lugar.tipo === 'OFICINA' ? 'bg-blue-500' :
                            lugar.tipo === 'ALMACEN' ? 'bg-purple-500' : 'bg-primary'
                          }`}></span>
                          {lugar.nombre}
                        </h3>
                        <p className="text-[11px] text-body-color dark:text-gray-400">
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">{lugar.inicial}</span> • {lugar.tipo?.charAt(0).toUpperCase() + lugar.tipo?.slice(1).toLowerCase()} • {activos.length} activos
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (isAuthenticated) {
                            router.push(`/admin/activos/lista`);
                          } else {
                            router.push(`/signin`);
                          }
                        }}
                        className="rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-white transition-all shadow-sm"
                      >
                        Gestionar
                      </button>
                    </div>

                    {/* Grid de Activos */}
                    {activos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {activos.slice(0, 5).map((activo) => (
                          <div
                            key={activo.id}
                            onClick={() => handleActivoClick(activo)}
                            className="group relative rounded-xl bg-white dark:bg-black/60 border border-stroke dark:border-strokedark overflow-hidden hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer"
                          >
                            {/* Imagen */}
                            <div className="relative h-40 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                              {activo.imagen ? (
                                <Image
                                  src={activo.imagen}
                                  alt={activo.nombre}
                                  fill
                                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <svg className="h-10 w-10 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="p-3">
                              <p className="text-[10px] font-mono font-bold text-primary mb-1 truncate">
                                {activo.codigo}
                              </p>
                              <h4 className="text-xs font-bold text-black dark:text-white mb-2 truncate group-hover:text-primary transition-colors">
                                {activo.nombre}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${getColorEstado(activo.estado)}`}>
                                  {activo.estado || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="h-10 w-10 mx-auto mb-2 opacity-50 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>No hay activos registrados en esta ubicación</p>
                      </div>
                    )}

                    {activos.length > 0 && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/lugar/${lugar.tipo?.toLowerCase()}/${lugar.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 px-4 py-2 text-xs font-bold text-primary transition-all"
                        >
                          Ver más activos ({activos.length} en total) →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {lugaresFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-550 dark:text-gray-400">
                No hay ubicaciones registradas del tipo seleccionado
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Imagen Fullscreen */}
      {imagenFullscreen && activoModal?.imagen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 cursor-zoom-out backdrop-blur-md"
          onClick={() => setImagenFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            onClick={() => setImagenFullscreen(false)}
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activoModal.imagen}
            alt={activoModal.nombre}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
