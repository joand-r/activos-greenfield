"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useEffect, useState, useRef } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { articuloService, Articulo } from "@/services/articulo.service";
import { categoriaService } from "@/services/categoria.service";
import { lugarService } from "@/services/lugar.service";
import { marcaService } from "@/services/marca.service";

const ArticuloPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState<Articulo[]>([]);
  const [sugerencias, setSugerencias] = useState<Articulo[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Filtros avanzados
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [lugarFiltro, setLugarFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  
  // Datos para filtros
  const [categorias, setCategorias] = useState<any[]>([]);
  const [lugares, setLugares] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  
  useEffect(() => {
    document.title = "Buscar Artículo | Activos Greenfield";
    cargarDatosFiltros();
    
    // Cerrar sugerencias al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setMostrarSugerencias(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarDatosFiltros = async () => {
    try {
      const [categoriasData, lugaresData, marcasData] = await Promise.all([
        categoriaService.getAll(),
        lugarService.getAll(),
        marcaService.getAll(),
      ]);
      setCategorias(categoriasData);
      setLugares(lugaresData);
      setMarcas(marcasData);
    } catch (error) {
      console.error("Error al cargar filtros:", error);
    }
  };

  // Búsqueda en tiempo real para sugerencias
  useEffect(() => {
    const buscarSugerencias = async () => {
      if (searchTerm.trim().length >= 2) {
        try {
          const data = await articuloService.buscar(searchTerm);
          setSugerencias(data.slice(0, 5)); // Mostrar solo 5 sugerencias
          setMostrarSugerencias(true);
        } catch (error) {
          console.error("Error al buscar sugerencias:", error);
          setSugerencias([]);
        }
      } else {
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    };

    const timeoutId = setTimeout(buscarSugerencias, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchTerm.trim() && !categoriaFiltro && !lugarFiltro && !marcaFiltro && !estadoFiltro) {
      setError("Por favor ingresa un término de búsqueda o selecciona al menos un filtro");
      return;
    }

    setError("");
    setMostrarSugerencias(false);
    showLoading();
    try {
      let data = await articuloService.buscar(searchTerm || ' ');
      
      // Aplicar filtros adicionales
      if (categoriaFiltro) {
        data = data.filter((art: Articulo) => art.categoria === categoriaFiltro);
      }
      if (lugarFiltro) {
        data = data.filter((art: Articulo) => art.lugar === lugarFiltro);
      }
      if (marcaFiltro) {
        data = data.filter((art: Articulo) => art.marca === marcaFiltro);
      }
      if (estadoFiltro) {
        data = data.filter((art: Articulo) => art.estado === estadoFiltro);
      }
      
      setResultados(data);
      setSearched(true);
    } catch (error: any) {
      console.error("Error al buscar:", error);
      setError(error.message || "Error al buscar artículos");
    } finally {
      hideLoading();
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoriaFiltro("");
    setLugarFiltro("");
    setMarcaFiltro("");
    setEstadoFiltro("");
    setResultados([]);
    setSugerencias([]);
    setMostrarSugerencias(false);
    setError("");
    setSearched(false);
  };

  const seleccionarSugerencia = (articulo: Articulo) => {
    setSearchTerm(articulo.codigo);
    setMostrarSugerencias(false);
    setResultados([articulo]);
    setSearched(true);
  };

  const imprimirArticulo = (articulo: Articulo) => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Artículo ${articulo.codigo} - ${articulo.nombre}</title>
        <style>
          @page {
            size: letter;
            margin: 1cm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 15px;
            font-size: 11px;
            line-height: 1.3;
          }
          .header { 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333; 
          }
          .title { 
            font-size: 14px;
            color: #555; 
          }
          .content {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .imagen { 
            width: 100%;
            height: auto;
            max-height: 200px;
            object-fit: cover;
            border: 1px solid #ddd;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 8px;
          }
          .info-item { 
            padding: 6px 8px; 
            background: #f5f5f5; 
            border-left: 2px solid #333; 
          }
          .info-label { 
            font-weight: bold; 
            color: #666; 
            font-size: 9px; 
            text-transform: uppercase; 
          }
          .info-value { 
            color: #333; 
            font-size: 11px; 
            margin-top: 2px; 
          }
          .descripcion { 
            padding: 10px; 
            background: #f9f9f9; 
            border: 1px solid #ddd; 
            margin-bottom: 15px;
            font-size: 10px;
          }
          .footer { 
            padding-top: 10px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            color: #666; 
            font-size: 8px;
            line-height: 1.4;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ACTIVOS GREENFIELD</div>
            <div class="title">Reporte de Artículo</div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #666;">
            <div>${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit'
            })}</div>
            <div>${new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>
        
        <div class="content">
          ${articulo.imagen ? `<img src="${articulo.imagen}" alt="${articulo.nombre}" class="imagen" />` : '<div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; color: #999; font-size: 10px;">Sin imagen</div>'}
          
          <div class="info-grid">
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Código</div>
              <div class="info-value">${articulo.codigo}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Nombre</div>
              <div class="info-value">${articulo.nombre}</div>
            </div>
            
            <!-- Información más importante primero -->
            <div class="info-item" style="grid-column: 1 / -1; background: #e8f5e9; border-left-color: #4caf50;">
              <div class="info-label">Lugar</div>
              <div class="info-value">${articulo.lugar || 'N/A'}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1; background: #e3f2fd; border-left-color: #2196f3;">
              <div class="info-label">Proveedor</div>
              <div class="info-value">${articulo.proveedor || 'N/A'}</div>
            </div>
            <div class="info-item" style="background: #fff3e0; border-left-color: #ff9800;">
              <div class="info-label">Marca</div>
              <div class="info-value">${articulo.marca || 'N/A'}</div>
            </div>
            <div class="info-item" style="background: #f3e5f5; border-left-color: #9c27b0;">
              <div class="info-label">Categoría</div>
              <div class="info-value">${articulo.categoria || 'N/A'}</div>
            </div>
            
            <!-- Otros datos -->
            <div class="info-item">
              <div class="info-label">Serie</div>
              <div class="info-value">${articulo.serie || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">${articulo.estado}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cantidad</div>
              <div class="info-value">${articulo.cantidad}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Precio Unitario</div>
              <div class="info-value">$${Number(articulo.precioUnitario || articulo.precio_unitario || 0).toFixed(2)}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1; background: #e8f5e9;">
              <div class="info-label">Precio Total</div>
              <div class="info-value" style="font-size: 13px; font-weight: bold; color: #2e7d32;">$${(Number(articulo.precioUnitario || articulo.precio_unitario || 0) * Number(articulo.cantidad || 0)).toFixed(2)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Constancia</div>
              <div class="info-value">${articulo.constancia || 'No'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nro. Constancia</div>
              <div class="info-value">${articulo.numeroConstancia || articulo.numero_constancia || 'N/A'}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Fecha de Adquisición</div>
              <div class="info-value">${articulo.fechaAdquisicion || articulo.fecha_adquisicion || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        ${articulo.descripcion ? `
          <div class="descripcion">
            <div class="info-label" style="margin-bottom: 4px;">Descripción</div>
            <div class="info-value">${articulo.descripcion}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Activos Greenfield - Sistema de Gestión de Inventario</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  };
  return (
    <>
      <Breadcrumb
        pageName="Buscar Artículo"
        description="Encuentra artículos en nuestro inventario"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Buscar Artículo
                </h2>

                {error && (
                  <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} onReset={handleReset}>
                  <div className="mb-6 relative" ref={searchRef}>
                    <label
                      htmlFor="search"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Buscar por nombre o código
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ej: Escritorio, VSP-001"
                        autoComplete="off"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-body-color hover:text-primary"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Sugerencias en tiempo real */}
                    {mostrarSugerencias && sugerencias.length > 0 && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-gray-dark">
                        {sugerencias.map((articulo) => (
                          <button
                            key={articulo.id}
                            type="button"
                            onClick={() => seleccionarSugerencia(articulo)}
                            className="w-full border-b border-stroke px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:border-strokedark dark:hover:bg-gray-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {articulo.imagen && (
                                <img
                                  src={articulo.imagen}
                                  alt={articulo.nombre}
                                  className="h-12 w-12 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-mono text-sm font-semibold text-primary">
                                  {articulo.codigo}
                                </p>
                                <p className="text-sm text-dark dark:text-white">
                                  {articulo.nombre}
                                </p>
                                <p className="text-xs text-body-color dark:text-body-color-dark">
                                  {articulo.lugar || 'Sin lugar'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      className="shadow-submit dark:shadow-submit-dark flex-1 rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
                      Buscar
                    </button>
                    <button 
                      type="reset"
                      className="rounded-sm bg-gray-300 px-9 py-4 text-base font-medium text-dark shadow-submit duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                      className="rounded-sm bg-blue-500 px-6 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </button>
                  </div>

                  {/* Filtros Avanzados */}
                  {mostrarFiltrosAvanzados && (
                    <div className="mt-6 rounded-lg border border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-gray-800">
                      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Filtros Avanzados</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Categoría
                          </label>
                          <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-white px-4 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                          >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Lugar
                          </label>
                          <select
                            value={lugarFiltro}
                            onChange={(e) => setLugarFiltro(e.target.value)}
                            className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-white px-4 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                          >
                            <option value="">Todos los lugares</option>
                            {lugares.map(lugar => (
                              <option key={lugar.id} value={lugar.nombre}>{lugar.nombre} ({lugar.iniciales})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Marca
                          </label>
                          <select
                            value={marcaFiltro}
                            onChange={(e) => setMarcaFiltro(e.target.value)}
                            className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-white px-4 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                          >
                            <option value="">Todas las marcas</option>
                            {marcas.map(marca => (
                              <option key={marca.id} value={marca.nombre}>{marca.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Estado
                          </label>
                          <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-white px-4 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                          >
                            <option value="">Todos los estados</option>
                            <option value="Excelente">Excelente</option>
                            <option value="Bueno">Bueno</option>
                            <option value="Regular">Regular</option>
                            <option value="Malo">Malo</option>
                            <option value="Transferido">Transferido</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                {/* Resultados */}
                {searched && (
                  <div className="mt-8">
                    <h3 className="mb-6 text-2xl font-semibold text-black dark:text-white">
                      {resultados.length > 0 ? `${resultados.length} artículo${resultados.length > 1 ? 's' : ''} encontrado${resultados.length > 1 ? 's' : ''}` : 'No se encontraron artículos'}
                    </h3>
                    {resultados.length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <svg className="mb-4 h-24 w-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg text-body-color dark:text-body-color-dark">
                          No se encontraron artículos con ese término
                        </p>
                        <p className="mt-2 text-sm text-body-color dark:text-body-color-dark opacity-70">
                          Intenta con otro código o nombre
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {resultados.map((articulo) => {
                          const getIconoPorEstado = (estado: string) => {
                            return null; // Sin iconos
                          };

                          const getColorPorEstado = (estado: string) => {
                            switch(estado) {
                              case 'Nuevo': return 'bg-green-500/90 text-white';
                              case 'Medio Uso': return 'bg-blue-500/90 text-white';
                              case 'Deteriorado': return 'bg-yellow-500/90 text-white';
                              case 'Reparación': return 'bg-red-500/90 text-white';
                              case 'Obsoleto': return 'bg-purple-500/90 text-white';
                              default: return 'bg-gray-500/90 text-white';
                            }
                          };

                          return (
                            <div key={articulo.id} className="group relative overflow-hidden rounded-lg border border-stroke bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-strokedark dark:bg-gray-dark">
                              {/* Botón de imprimir - esquina superior derecha */}
                              <button
                                onClick={() => imprimirArticulo(articulo)}
                                className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary"
                                title="Imprimir reporte"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                              </button>

                              {/* Imagen */}
                              <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img 
                                  src={articulo.imagen || '/images/logo/logo-placeholder.png'} 
                                  alt={articulo.nombre}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/logo/logo-placeholder.png';
                                  }}
                                />
                                {/* Badge de cantidad */}
                                <div className="absolute bottom-3 right-3 flex items-center rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">
                                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span>{articulo.cantidad}</span>
                                </div>
                                {/* Badge inactivo si corresponde */}
                                {!articulo.activo && (
                                  <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                    Inactivo
                                  </div>
                                )}
                              </div>

                              {/* Contenido */}
                              <div className="p-5">
                                {/* Código */}
                                <p className="mb-2 font-mono text-xs font-semibold text-primary dark:text-primary">
                                  {articulo.codigo}
                                </p>

                                {/* Nombre */}
                                <h4 className="mb-3 line-clamp-2 text-lg font-bold text-black dark:text-white">
                                  {articulo.nombre}
                                </h4>

                                {/* Serie */}
                                {articulo.serie && (
                                  <p className="mb-3 text-sm text-body-color dark:text-body-color-dark">
                                    <span className="font-medium">Serie:</span> {articulo.serie}
                                  </p>
                                )}

                                {/* Información adicional - REORGANIZADA */}
                                <div className="mb-3 space-y-2 border-t border-stroke pt-3 dark:border-strokedark">
                                  {/* INFORMACIÓN MÁS IMPORTANTE PRIMERO */}
                                  <div className="rounded-md bg-green-50 p-2 dark:bg-green-900/20">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-semibold text-green-700 dark:text-green-400">Lugar:</span>
                                      <span className="font-medium text-black dark:text-white">
                                        {articulo.lugar || articulo.lugar_nombre || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-semibold text-blue-700 dark:text-blue-400">Proveedor:</span>
                                      <span className="font-medium text-black dark:text-white">
                                        {articulo.proveedor || articulo.proveedor_nombre || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-body-color dark:text-body-color-dark">Marca:</span>
                                    <span className="font-medium text-black dark:text-white">
                                      {articulo.marca || articulo.marca_nombre || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-body-color dark:text-body-color-dark">Categoría:</span>
                                    <span className="font-medium text-black dark:text-white">
                                      {articulo.categoria || articulo.categoria_nombre || 'N/A'}
                                    </span>
                                  </div>
                                  
                                  {/* Separador */}
                                  <div className="border-t border-stroke dark:border-strokedark my-2"></div>
                                  
                                  {/* Precio Total - Destacado */}
                                  <div className="rounded-md bg-green-100 p-2 dark:bg-green-900/30">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-green-700 dark:text-green-300">Precio Total:</span>
                                      <span className="text-base font-bold text-green-800 dark:text-green-200">
                                        ${(Number(articulo.precioUnitario || articulo.precio_unitario || 0) * Number(articulo.cantidad || 0)).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Constancia */}
                                  {(articulo.constancia || articulo.numeroConstancia || articulo.numero_constancia) && (
                                    <div className="text-xs space-y-1 pt-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-body-color dark:text-body-color-dark">Constancia:</span>
                                        <span className="font-medium text-black dark:text-white">
                                          {articulo.constancia || 'Sí'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-body-color dark:text-body-color-dark">Nro. Constancia:</span>
                                        <span className="font-medium text-black dark:text-white">
                                          {articulo.numeroConstancia || articulo.numero_constancia || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {articulo.descripcion && (
                                    <div className="pt-2">
                                      <p className="line-clamp-2 text-xs text-body-color dark:text-body-color-dark">
                                        {articulo.descripcion}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Badge de estado */}
                                <div className="flex justify-center">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${getColorPorEstado(articulo.estado)}`}>
                                    <span>{articulo.estado}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-12">
                  <p className="text-center text-body-color dark:text-body-color-dark">
                    ¿No encuentras lo que buscas? <a href="/contact" className="text-primary hover:underline">Contáctanos</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArticuloPage;
