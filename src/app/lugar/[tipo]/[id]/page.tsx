"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { activoService, Activo } from "@/services/activo.service";
import { lugarService } from "@/services/lugar.service";
import Link from "next/link";

export default function LugarDetallesPage() {
  const params = useParams();
  const lugarId = params.id as string;
  const tipo = params.tipo as string;
  
  const [articulos, setArticulos] = useState<Activo[]>([]);
  const [lugar, setLugar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [lugarId]);

  const cargarDatos = async () => {
    try {
      const [articulosData, lugarData] = await Promise.all([
        activoService.getAll(),
        lugarService.getById(parseInt(lugarId))
      ]);
      
      // Filtrar activos por lugar
      const articulosFiltrados = articulosData.filter(
        (art: Activo) => Number(art.lugar_id) === parseInt(lugarId)
      );
      
      setArticulos(articulosFiltrados);
      setLugar(lugarData);
      document.title = `${lugarData.nombre} | Activos Greenfield`;
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconoPorEstado = (estado: string) => {
    return null; // Sin iconos
  };

  const getColorPorEstado = (estado: string) => {
    switch(estado) {
      case "Excelente": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Bueno": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Regular": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Malo": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Transferido": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  const generarReporteGeneral = () => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    
    const articulosActivos = articulos.filter(a => !['VENDIDO','DONADO','DANADO','TRANSFERIR'].includes(a.estado ?? ''));
    const totalArticulos = articulos.length;
    const totalActivos = articulosActivos.length;
    const totalInactivos = totalArticulos - totalActivos;
    
    // Agrupar por estado
    const porEstado: {[key: string]: number} = {};
    articulos.forEach(art => {
      porEstado[art.estado] = (porEstado[art.estado] || 0) + 1;
    });
    
    // Agrupar por categoría
    const porCategoria: {[key: string]: number} = {};
    articulos.forEach(art => {
      const cat = art.tipo_activo || 'Sin tipo';
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });
    
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte General - ${lugar?.nombre}</title>
        <style>
          @page {
            size: letter;
            margin: 1.5cm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header { 
            border-bottom: 3px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo { 
            font-size: 20px; 
            font-weight: bold; 
            color: #333; 
          }
          .title { 
            font-size: 16px;
            color: #555;
            margin-top: 5px;
          }
          .lugar-info {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #333;
            margin-bottom: 20px;
          }
          .lugar-info h2 {
            font-size: 18px;
            margin-bottom: 8px;
          }
          .lugar-info p {
            font-size: 11px;
            color: #666;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
            border-radius: 4px;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #ddd;
          }
          .items-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          .item-card {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 9px;
            background: #fafafa;
          }
          .item-code {
            font-weight: bold;
            font-family: monospace;
            margin-bottom: 3px;
          }
          .item-name {
            font-size: 10px;
            margin-bottom: 3px;
          }
          .item-details {
            color: #666;
            font-size: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10px;
          }
          th, td {
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #ddd;
          }
          th {
            background: #f5f5f5;
            font-weight: bold;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            color: #666; 
            font-size: 8px;
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
            <div class="title">Reporte General de Inventario</div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #666;">
            <div>${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}</div>
            <div>${new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>
        
        <div class="lugar-info">
          <h2>${lugar?.nombre} (${lugar?.inicial})</h2>
          <p>Tipo: ${lugar?.tipo?.charAt(0).toUpperCase()}${lugar?.tipo?.slice(1)} | Total de artículos: ${totalArticulos}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${totalArticulos}</div>
            <div class="stat-label">Total Artículos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalActivos}</div>
            <div class="stat-label">Activos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalInactivos}</div>
            <div class="stat-label">Inactivos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${articulos.length}</div>
            <div class="stat-label">Total Activos</div>
          </div>
        </div>
        
        <div class="section-title">Distribución por Estado</div>
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: center;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(porEstado).map(([estado, cant]) => `
              <tr>
                <td>${estado}</td>
                <td style="text-align: center;">${cant}</td>
                <td style="text-align: center;">${((cant / totalArticulos) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="section-title">Distribución por Categoría</div>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: center;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(porCategoria).map(([categoria, cant]) => `
              <tr>
                <td>${categoria}</td>
                <td style="text-align: center;">${cant}</td>
                <td style="text-align: center;">${((cant / totalArticulos) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="section-title">Listado Completo de Artículos</div>
        <div class="items-grid">
          ${articulos.map(art => `
            <div class="item-card">
              <div class="item-code">${art.codigo}</div>
              <div class="item-name">${art.nombre}</div>
              <div class="item-details">
                Estado: ${art.estado}<br>
                Tipo: ${art.tipo_activo || 'N/A'} | Marca: ${art.marca_nombre || 'N/A'}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>Activos Greenfield - Sistema de Gestión de Inventario</p>
          <p>Este documento contiene información confidencial</p>
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg text-body-color">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Lugar"
        description="Inventario de activos y reportes de la ubicación seleccionada"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {/* Header con estadísticas */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-black dark:text-white mb-1">
                  {lugar?.nombre}
                </h1>
                <p className="text-xs text-body-color dark:text-gray-400">
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">{lugar?.inicial}</span> • 
                  <span className="capitalize"> {lugar?.tipo?.toLowerCase()}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generarReporteGeneral}
                  className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-green-500/10"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generar Reporte
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </Link>
              </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">{articulos.length}</p>
                    <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">Total Artículos</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">
                      {articulos.filter(a => !['VENDIDO','DONADO','DANADO','TRANSFERIR'].includes(a.estado ?? '')).length}
                    </p>
                    <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">Activos</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">
                      {articulos.filter(a => ['VENDIDO','DONADO','DANADO','TRANSFERIR'].includes(a.estado ?? '')).length}
                    </p>
                    <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">Inactivos</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">
                      {articulos.length}
                    </p>
                    <p className="text-[10px] font-semibold text-body-color dark:text-gray-400 uppercase tracking-wider">Total Activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Artículos */}
          {articulos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articulos.map((articulo) => (
                <div
                  key={articulo.id}
                  className="group relative rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Imagen */}
                  <div className="relative h-52 bg-gray-50/50 dark:bg-black/20 overflow-hidden">
                    {articulo.imagen ? (
                      <img
                        src={articulo.imagen}
                        alt={articulo.nombre}
                        className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg className="h-16 w-16 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                    {/* Badge de inactivo */}
                    {['VENDIDO','DONADO','DANADO','TRANSFERIR'].includes(articulo.estado ?? '') && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                        Inactivo
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-[10px] font-mono font-bold text-primary mb-1">
                        {articulo.codigo}
                      </p>
                      <h3 className="text-sm font-bold text-black dark:text-white mb-1 line-clamp-2 min-h-[40px]">
                        {articulo.nombre}
                      </h3>
                      {articulo.serie && (
                        <p className="text-[10px] text-body-color dark:text-gray-400">
                          Serie: {articulo.serie}
                        </p>
                      )}
                    </div>

                    {/* Info adicional */}
                    <div className="space-y-1.5 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-body-color dark:text-gray-400">Tipo:</span>
                        <span className="font-semibold text-black dark:text-white">{articulo.tipo_activo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-body-color dark:text-gray-400">Marca:</span>
                        <span className="font-semibold text-black dark:text-white">{articulo.marca_nombre || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getColorPorEstado(articulo.estado)}`}>
                        {articulo.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="h-24 w-24 mx-auto mb-4 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-xl text-gray-500 dark:text-gray-400">
                No hay artículos en esta ubicación
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
