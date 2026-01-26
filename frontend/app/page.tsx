"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articuloService, Articulo } from "@/services/articulo.service";
import { lugarService } from "@/services/lugar.service";

interface Lugar {
  id: number;
  nombre: string;
  tipo: string;
  iniciales: string;
  articulos?: Articulo[];
}

export default function Home() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [articulosPorLugar, setArticulosPorLugar] = useState<{[key: number]: Articulo[]}>({});
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const lugaresFiltrados = tipoSeleccionado === "todos" 
    ? lugares 
    : lugares.filter(l => l.tipo === tipoSeleccionado);

  const totalArticulos = Object.values(articulosPorLugar).reduce((sum, arts) => sum + arts.length, 0);
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

  const getIconoPorEstado = (estado: string) => {
    return null; // Sin iconos
  };

  return (
    <>
      <ScrollUp />
      <Hero />

      {/* Estadísticas */}
      <section className="py-16 md:py-20 lg:py-28 bg-gray-light dark:bg-gray-dark">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="wow fadeInUp mb-8 text-center" data-wow-delay=".1s">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-4xl font-bold text-black dark:text-white">
                  {loading ? "..." : totalArticulos}
                </h3>
                <p className="text-base text-body-color">Activos Totales</p>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="wow fadeInUp mb-8 text-center" data-wow-delay=".15s">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-4xl font-bold text-black dark:text-white">
                  {loading ? "..." : totalLugares}
                </h3>
                <p className="text-base text-body-color">Ubicaciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros por Tipo de Lugar */}
      <section className="py-16 md:py-20 lg:py-28">
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
                                <img
                                  src={articulo.imagen}
                                  alt={articulo.nombre}
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
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

          {lugaresFiltrados.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No hay ubicaciones del tipo seleccionado
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-28 bg-gray-light dark:bg-bg-color-dark">
        <div className="container">
          <div className="wow fadeInUp rounded-lg bg-primary px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:px-8 xl:px-[55px]" data-wow-delay=".1s">
            <div className="-mx-4 flex flex-wrap items-center">
              <div className="w-full px-4 lg:w-1/2">
                <h2 className="mb-4 text-3xl font-bold leading-tight text-white dark:text-white sm:text-4xl sm:leading-tight">
                  ¿Necesitas gestionar los activos?
                </h2>
                <p className="mb-6 text-base leading-relaxed text-white/90 dark:text-gray-300 lg:mb-0">
                  Accede al panel de administración para gestionar todos los activos del sistema
                </p>
              </div>
              <div className="w-full px-4 lg:w-1/2">
                <div className="flex flex-wrap lg:justify-end gap-3">
                  <Link
                    href="/admin/articulos/lista"
                    className="inline-block rounded-lg bg-white dark:bg-gray-800 px-8 py-3 text-base font-semibold text-primary dark:text-white transition hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Panel de Admin
                  </Link>
                  <Link
                    href="/admin/articulos/registrar"
                    className="inline-block rounded-lg border-2 border-white dark:border-gray-600 bg-transparent px-8 py-3 text-base font-semibold text-white dark:text-white transition hover:bg-white hover:text-primary dark:hover:bg-gray-700"
                  >
                    Registrar Activo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
