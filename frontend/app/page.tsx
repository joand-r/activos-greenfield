"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalActivos, setTotalActivos] = useState(0);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [activosPorLugar, setActivosPorLugar] = useState<{[key: number]: Activo[]}>({});
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("todos");
  const [activoModal, setActivoModal] = useState<Activo | null>(null);

  useEffect(() => {
    document.title = "Activos Greenfield - Sistema de Gestión de Activos";
    cargarDatos();
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
    { id: "VIVIENDA", nombre: "Viviendas", color: "bg-green-500" },
    { id: "OFICINA", nombre: "Oficinas", color: "bg-blue-500" },
    { id: "ALMACEN", nombre: "Almacenes", color: "bg-purple-500" },
    { id: "CENTER", nombre: "Centers", color: "bg-orange-500" },
    { id: "PROPIEDAD", nombre: "Propiedades", color: "bg-pink-500" },
  ];

  const getColorPorTipo = (tipo: string) => {
    switch(tipo) {
      case "VIVIENDA": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "OFICINA": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "ALMACEN": return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      case "CENTER": return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "PROPIEDAD": return "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800";
      default: return "bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700";
    }
  };

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
            <div className="relative h-52 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {activoModal.imagen ? (
                <Image src={activoModal.imagen} alt={activoModal.nombre} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-20 w-20 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {/* Badge estado sobre la imagen */}
              <div className="absolute bottom-3 left-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getColorEstado(activoModal.estado)}`}>
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

              {/* Fecha adquisición (solo año, no monto) */}
              {activoModal.fecha_adquision && (
                <p className="mt-3 text-xs text-gray-400">
                  En uso desde {new Date(activoModal.fecha_adquision).getFullYear()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section con Buscador Principal */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-dark dark:via-bg-color-dark dark:to-gray-dark pt-[120px] pb-[80px] md:pt-[150px] md:pb-[100px] lg:pt-[180px] lg:pb-[120px]">
        {/* Decoraciones de fondo */}
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
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                  <span className="text-sm font-medium text-primary">
                    {totalActivos} Activos Registrados
                  </span>
                </div>

                {/* Título Principal */}
                <h1 className="mb-5 text-4xl font-bold leading-tight text-black dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Sistema de Gestión
                  <span className="block text-primary">de Activos Greenfield</span>
                </h1>

                <p className="mb-10 text-base text-body-color dark:text-body-color-dark sm:text-lg md:text-xl">
                  Administra y controla todos los activos de tus viviendas, almacenes y oficinas de manera eficiente
                </p>

                {/* Buscador Principal */}
                <div className="relative mx-auto max-w-[600px]">
                  <div className="relative">
                    {/* Icono de búsqueda */}
                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>

                    {/* Input */}
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar por código, nombre o descripción..."
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white py-5 pl-14 pr-5 text-base font-medium text-black outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />

                    {/* Indicador de carga */}
                    {loading && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Sugerencias de búsqueda */}
                  {!searchTerm && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm text-body-color">Búsqueda rápida:</span>
                      <button 
                        onClick={() => handleSearch("Computadora")}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Computadora
                      </button>
                      <button 
                        onClick={() => handleSearch("Silla")}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Silla
                      </button>
                      <button 
                        onClick={() => handleSearch("Mesa")}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Mesa
                      </button>
                    </div>
                  )}

                  {/* Resultados de búsqueda */}
                  {searchTerm && searchResults.length > 0 && (
                    <div className="mt-6 max-h-[500px] overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-dark">
                      <div className="p-4">
                        <p className="mb-4 text-sm font-semibold text-body-color">
                          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-3">
                          {searchResults.map((activo) => (
                            <div
                              key={activo.id}
                              onClick={() => handleActivoClick(activo)}
                              className="group flex cursor-pointer items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary dark:hover:bg-primary/10"
                            >
                              {/* Imagen */}
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 relative">
                                {activo.imagen ? (
                                  <Image
                                    src={activo.imagen}
                                    alt={activo.nombre}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1">
                                <div className="mb-1 flex items-start justify-between">
                                  <h4 className="font-bold text-black group-hover:text-primary dark:text-white dark:group-hover:text-primary">
                                    {activo.nombre}
                                  </h4>
                                </div>
                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {activo.codigo}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-body-color">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    {activo.lugar_nombre || 'Sin ubicación'}
                                  </span>
                                  <span>•</span>
                                  <span>{activo.estado}</span>
                                </div>
                              </div>

                              {/* Icono flecha */}
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="mt-6 rounded-2xl border-2 border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-dark">
                      <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-base text-body-color">
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
      <section className="py-16 md:py-20 lg:py-28 bg-gray-light dark:bg-gray-dark">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[700px] text-center lg:mb-16">
                <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl md:text-[40px]">
                  Activos por Ubicación
                </h2>
                <p className="text-base text-body-color">
                  Explora los activos organizados por sus ubicaciones físicas
                </p>
              </div>
            </div>
          </div>

          {/* Tabs de tipos */}
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {tiposLugar.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoSeleccionado(tipo.id)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                  tipoSeleccionado === tipo.id
                    ? `${tipo.color} text-white shadow-md`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  <div className={`wow fadeInUp rounded-lg border-2 ${getColorPorTipo(lugar.tipo)} p-6`} data-wow-delay=".1s">
                    {/* Header del Lugar */}
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                          {lugar.nombre}
                        </h3>
                        <p className="text-sm text-body-color">
                          <span className="font-semibold">{lugar.inicial}</span> • {lugar.tipo?.charAt(0).toUpperCase() + lugar.tipo?.slice(1)} • {activos.length} activos
                        </p>
                      </div>
                      <Link
                        href={`/admin/activos/lista`}
                        className="rounded-lg bg-primary hover:bg-primary/90 px-5 py-2.5 text-sm font-semibold text-white transition-all"
                      >
                        Ver Todos
                      </Link>
                    </div>

                    {/* Grid de Activos */}
                    {activos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {activos.slice(0, 10).map((activo) => (
                          <div
                            key={activo.id}
                            onClick={() => handleActivoClick(activo)}
                            className="group relative rounded-lg bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                          >
                            {/* Imagen */}
                            <div className="relative h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              {activo.imagen ? (
                                <Image
                                  src={activo.imagen}
                                  alt={activo.nombre}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="p-3">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 truncate">
                                {activo.codigo}
                              </p>
                              <h4 className="text-sm font-bold text-black dark:text-white mb-2 truncate">
                                {activo.nombre}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-body-color">
                                  {activo.estado || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg className="h-16 w-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>No hay activos en esta ubicación</p>
                      </div>
                    )}

                    {activos.length > 10 && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/admin/activos/lista`}
                          className="text-sm text-primary font-semibold hover:underline"
                        >
                          Ver {activos.length - 10} activos más →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {lugaresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No hay ubicaciones del tipo seleccionado
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
