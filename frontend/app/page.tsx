"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { articuloService, Articulo } from "@/services/articulo.service";
import { lugarService } from "@/services/lugar.service";
import { useRouter } from "next/navigation";

interface Lugar {
  id: number;
  nombre: string;
  tipo: string;
  iniciales: string;
  articulos?: Articulo[];
}

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalArticulos, setTotalArticulos] = useState(0);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [articulosPorLugar, setArticulosPorLugar] = useState<{[key: number]: Articulo[]}>({});
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("todos");

  useEffect(() => {
    document.title = "Activos Greenfield - Sistema de Gestión de Activos";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [lugaresData, articulosData] = await Promise.all([
        lugarService.getAll(),
        articuloService.getAll({ incluirInactivos: 'true' })
      ]);
      
      setLugares(lugaresData);
      setTotalArticulos(articulosData.length);
      
      // Agrupar artículos por lugar
      const articulosPorLugarTemp: {[key: number]: Articulo[]} = {};
      lugaresData.forEach((lugar: Lugar) => {
        articulosPorLugarTemp[lugar.id] = articulosData.filter(
          (art: Articulo) => art.lugar_id === lugar.id || art.lugarId === lugar.id
        );
      });
      
      setArticulosPorLugar(articulosPorLugarTemp);
    } catch (error) {
      console.error("Error al cargar datos:", error);
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
      const articulos = await articuloService.getAll({ incluirInactivos: 'true' });
      const filtered = articulos.filter((articulo: Articulo) => 
        articulo.nombre.toLowerCase().includes(value.toLowerCase()) ||
        articulo.codigo.toLowerCase().includes(value.toLowerCase()) ||
        (articulo.descripcion && articulo.descripcion.toLowerCase().includes(value.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error al buscar:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArticuloClick = (articulo: Articulo) => {
    router.push(`/articulo/${articulo.id}`);
  };

  const lugaresFiltrados = tipoSeleccionado === "todos" 
    ? lugares 
    : lugares.filter(l => l.tipo === tipoSeleccionado);

  const totalLugares = lugares.length;

  const tiposLugar = [
    { id: "todos", nombre: "Todos", color: "bg-gray-500" },
    { id: "vivienda", nombre: "Viviendas", color: "bg-green-500" },
    { id: "oficina", nombre: "Oficinas", color: "bg-blue-500" },
    { id: "almacen", nombre: "Almacenes", color: "bg-purple-500" },
  ];

  const getColorPorTipo = (tipo: string) => {
    switch(tipo) {
      case "vivienda": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "oficina": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "almacen": return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default: return "bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <>
      <ScrollUp />
      
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
                    {totalArticulos} Activos Registrados
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
                          {searchResults.map((articulo) => (
                            <div
                              key={articulo.id}
                              onClick={() => handleArticuloClick(articulo)}
                              className="group flex cursor-pointer items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary dark:hover:bg-primary/10"
                            >
                              {/* Imagen */}
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 relative">
                                {articulo.imagen ? (
                                  <Image
                                    src={articulo.imagen}
                                    alt={articulo.nombre}
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
                                    {articulo.nombre}
                                  </h4>
                                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                    x{articulo.cantidad}
                                  </span>
                                </div>
                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {articulo.codigo}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-body-color">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    {articulo.lugar_nombre || 'Sin ubicación'}
                                  </span>
                                  <span>•</span>
                                  <span>{articulo.estado}</span>
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

                {/* Accesos rápidos */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/articulos"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
                  >
                    <span>Ver Todos los Activos</span>
                    <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
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

          {/* Lugares con sus artículos */}
          <div className="-mx-4 flex flex-wrap">
            {lugaresFiltrados.map((lugar) => {
              const articulos = articulosPorLugar[lugar.id] || [];
              const articulosActivos = articulos.filter(a => a.activo !== false);
              
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
                          <span className="font-semibold">{lugar.iniciales}</span> • {lugar.tipo.charAt(0).toUpperCase() + lugar.tipo.slice(1)} • {articulosActivos.length} activos
                        </p>
                      </div>
                      <Link
                        href={`/lugar/${lugar.tipo}/${lugar.id}`}
                        className="rounded-lg bg-primary hover:bg-primary/90 px-5 py-2.5 text-sm font-semibold text-white transition-all"
                      >
                        Ver Todos
                      </Link>
                    </div>

                    {/* Grid de Artículos */}
                    {articulos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {articulos.slice(0, 10).map((articulo) => (
                          <div
                            key={articulo.id}
                            className="group relative rounded-lg bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                          >
                            {/* Imagen */}
                            <div className="relative h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              {articulo.imagen ? (
                                <Image
                                  src={articulo.imagen}
                                  alt={articulo.nombre}
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
                              {/* Badge de cantidad */}
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                                x{articulo.cantidad}
                              </div>
                            </div>
                            
                            {/* Info */}
                            <div className="p-3">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 truncate">
                                {articulo.codigo}
                              </p>
                              <h4 className="text-sm font-bold text-black dark:text-white mb-2 truncate">
                                {articulo.nombre}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-body-color">
                                  {articulo.estado}
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
                        <p>No hay artículos en esta ubicación</p>
                      </div>
                    )}

                    {articulos.length > 10 && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/lugar/${lugar.tipo}/${lugar.id}`}
                          className="text-sm text-primary font-semibold hover:underline"
                        >
                          Ver {articulos.length - 10} artículos más →
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
