"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import InfoModal from "@/components/InfoModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { articuloService, Articulo } from "@/services/articulo.service";
import { categoriaService } from "@/services/categoria.service";
import { lugarService } from "@/services/lugar.service";
import { marcaService } from "@/services/marca.service";
import { proveedorService } from "@/services/proveedor.service";

const ListaArticulosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [lugares, setLugares] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<any>({});
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [lugarFiltro, setLugarFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [vistaActivos, setVistaActivos] = useState<'activos' | 'transferidos' | 'todos'>('activos');
  const [error, setError] = useState("");
  
  // Estados para modal informativo
  const [modalInfo, setModalInfo] = useState(false);
  
  // Estados para el modal de reporte
  const [columnasReporte, setColumnasReporte] = useState({
    codigo: true,
    nombre: true,
    descripcion: false,
    serie: true,
    cantidad: true,
    precioUnitario: false,
    estado: true,
    categoria: true,
    marca: true,
    lugar: true,
    proveedor: false,
    fechaAdquisicion: false,
    imagen: false,
  });

  useEffect(() => {
    document.title = "Lista de Artículos | Activos Greenfield";
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaActivos]);

  const cargarDatos = async () => {
    showLoading();
    try {
      // Siempre cargar TODOS los artículos (incluidos inactivos) para poder calcular los contadores correctamente
      const params = { incluirInactivos: 'true' };
      const [articulosData, categoriasData, lugaresData, marcasData, proveedoresData] = await Promise.all([
        articuloService.getAll(params),
        categoriaService.getAll(),
        lugarService.getAll(),
        marcaService.getAll(),
        proveedorService.getAll(),
      ]);
      setArticulos(articulosData);
      setCategorias(categoriasData);
      setLugares(lugaresData);
      setMarcas(marcasData);
      setProveedores(proveedoresData);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      setError(error.message || "Error al cargar los datos");
    } finally {
      hideLoading();
    }
  };

  const intentarEliminarArticulo = () => {
    setModalInfo(true);
  };

  // Filtrar artículos
  const articulosFiltrados = articulos.filter((articulo) => {
    const matchFiltro = articulo.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                        articulo.codigo.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaFiltro === "" || articulo.categoria === categoriaFiltro;
    const matchLugar = lugarFiltro === "" || articulo.lugar === lugarFiltro;
    const matchMarca = marcaFiltro === "" || articulo.marca === marcaFiltro;
    const matchEstado = estadoFiltro === "" || articulo.estado === estadoFiltro;
    
    // Filtro por vista
    if (vistaActivos === 'activos') {
      return matchFiltro && matchCategoria && matchLugar && matchMarca && matchEstado && articulo.activo !== false && articulo.estado !== 'Transferido';
    } else if (vistaActivos === 'transferidos') {
      return matchFiltro && matchCategoria && matchLugar && matchMarca && matchEstado && (articulo.activo === false || articulo.estado === 'Transferido');
    } else {
      // Vista 'todos' - sin filtrar por activo
      return matchFiltro && matchCategoria && matchLugar && matchMarca && matchEstado;
    }
  });

  // Calcular totales
  const totalArticulos = articulosFiltrados.length;
  const valorTotal = articulosFiltrados.reduce((sum, art) => {
    const precio = art.precioUnitario || art.precio_unitario || 0;
    const cantidad = art.cantidad || 0;
    return sum + (precio * cantidad);
  }, 0);

  const abrirModal = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    setDatosEdicion({
      nombre: articulo.nombre,
      descripcion: articulo.descripcion || '',
      cantidad: articulo.cantidad,
      estado: articulo.estado,
      serie: articulo.serie || '',
      precioUnitario: articulo.precioUnitario || articulo.precio_unitario || 0,
      categoriaId: articulo.categoriaId || articulo.categoria_id,
      lugarId: articulo.lugarId || articulo.lugar_id,
      marcaId: articulo.marcaId || articulo.marca_id,
      proveedorId: articulo.proveedorId || articulo.proveedor_id,
      constancia: articulo.constancia || 'Proforma',
      numeroConstancia: articulo.numeroConstancia || articulo.numero_constancia || '',
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setArticuloSeleccionado(null);
    setModoEdicion(false);
    setDatosEdicion({});
  };

  const generarReportePDF = () => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    
    const columnas = Object.entries(columnasReporte)
      .filter(([_, incluir]) => incluir)
      .map(([col]) => col);
    
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Artículos</title>
        <style>
          @page { size: letter landscape; margin: 1cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; font-size: 9px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; }
          .logo { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 8px; }
          th, td { padding: 4px 6px; text-align: left; border: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background: #fafafa; }
          .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ACTIVOS GREENFIELD</div>
            <div>Reporte de Artículos</div>
          </div>
          <div style="text-align: right; font-size: 9px;">
            <div>Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
            <div>Total: ${articulosFiltrados.length} artículos</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              ${columnas.map(col => {
                const nombres: any = {
                  codigo: 'Código',
                  nombre: 'Nombre',
                  descripcion: 'Descripción',
                  serie: 'Serie',
                  cantidad: 'Cant.',
                  precioUnitario: 'Precio',
                  estado: 'Estado',
                  categoria: 'Categoría',
                  marca: 'Marca',
                  lugar: 'Lugar',
                  proveedor: 'Proveedor',
                  fechaAdquisicion: 'Fecha Adq.',
                  imagen: 'Imagen'
                };
                return `<th>${nombres[col]}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${articulosFiltrados.map(art => `
              <tr>
                ${columnas.map(col => {
                  let valor = '';
                  switch(col) {
                    case 'codigo': valor = art.codigo; break;
                    case 'nombre': valor = art.nombre; break;
                    case 'descripcion': valor = art.descripcion || 'N/A'; break;
                    case 'serie': valor = art.serie || 'N/A'; break;
                    case 'cantidad': valor = art.cantidad?.toString() || '0'; break;
                    case 'precioUnitario': 
                      const precio = Number(art.precioUnitario || art.precio_unitario || 0);
                      valor = '$' + precio.toFixed(2); 
                      break;
                    case 'estado': valor = art.estado; break;
                    case 'categoria': valor = art.categoria || 'N/A'; break;
                    case 'marca': valor = art.marca || 'N/A'; break;
                    case 'lugar': valor = art.lugar || 'N/A'; break;
                    case 'proveedor': valor = art.proveedor || 'N/A'; break;
                    case 'fechaAdquisicion': valor = art.fechaAdquisicion || art.fecha_adquisicion || 'N/A'; break;
                    case 'imagen': valor = art.imagen ? 'Sí' : 'No'; break;
                  }
                  return `<td>${valor}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Activos Greenfield - Sistema de Gestión de Inventario</p>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 250); }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  const generarReporteExcel = () => {
    const columnas = Object.entries(columnasReporte)
      .filter(([_, incluir]) => incluir)
      .map(([col]) => col);
    
    const nombres: any = {
      codigo: 'Código',
      nombre: 'Nombre',
      descripcion: 'Descripción',
      serie: 'Serie',
      cantidad: 'Cantidad',
      precioUnitario: 'Precio Unitario',
      estado: 'Estado',
      categoria: 'Categoría',
      marca: 'Marca',
      lugar: 'Lugar',
      proveedor: 'Proveedor',
      fechaAdquisicion: 'Fecha Adquisición',
      imagen: 'Tiene Imagen'
    };
    
    // Crear CSV
    let csv = columnas.map(col => nombres[col]).join(',') + '\n';
    
    articulosFiltrados.forEach(art => {
      const fila = columnas.map(col => {
        let valor = '';
        switch(col) {
          case 'codigo': valor = art.codigo; break;
          case 'nombre': valor = art.nombre; break;
          case 'descripcion': valor = (art.descripcion || 'N/A').replace(/,/g, ';'); break;
          case 'serie': valor = art.serie || 'N/A'; break;
          case 'cantidad': valor = art.cantidad?.toString() || '0'; break;
          case 'precioUnitario': 
            const precioExcel = Number(art.precioUnitario || art.precio_unitario || 0);
            valor = precioExcel.toString(); 
            break;
          case 'estado': valor = art.estado; break;
          case 'categoria': valor = art.categoria || 'N/A'; break;
          case 'marca': valor = art.marca || 'N/A'; break;
          case 'lugar': valor = art.lugar || 'N/A'; break;
          case 'proveedor': valor = art.proveedor || 'N/A'; break;
          case 'fechaAdquisicion': valor = art.fechaAdquisicion || art.fecha_adquisicion || 'N/A'; break;
          case 'imagen': valor = art.imagen ? 'Sí' : 'No'; break;
        }
        return `"${valor}"`;
      }).join(',');
      csv += fila + '\n';
    });
    
    // Descargar
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `articulos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setModalReporteAbierto(false);
  };

  const imprimirTablaFiltrada = () => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tabla de Artículos Filtrados</title>
        <style>
          @page { size: letter landscape; margin: 1cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; }
          .header { 
            border-bottom: 3px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
          }
          .logo { font-size: 24px; font-weight: bold; color: #059669; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .info-box { 
            background: #f5f5f5; 
            padding: 10px 15px; 
            border-radius: 5px; 
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .filters { 
            font-size: 10px; 
            color: #666;
            flex: 1;
          }
          .filter-item { 
            display: inline-block; 
            margin-right: 15px; 
            background: white;
            padding: 4px 8px;
            border-radius: 3px;
            margin-bottom: 5px;
          }
          .stats { 
            text-align: right; 
            font-size: 11px;
            font-weight: bold;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th, td { 
            padding: 8px 10px; 
            text-align: left; 
            border: 1px solid #ddd; 
          }
          th { 
            background: #059669; 
            color: white;
            font-weight: bold; 
            text-transform: uppercase;
            font-size: 9px;
          }
          tr:nth-child(even) { background: #f9fafb; }
          tr:hover { background: #f3f4f6; }
          .footer { 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 2px solid #ddd; 
            text-align: center; 
            font-size: 9px; 
            color: #666;
          }
          .badge { 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-size: 8px; 
            font-weight: 600;
          }
          .badge-active { background: #d1fae5; color: #065f46; }
          .badge-inactive { background: #fee2e2; color: #991b1b; }
          .badge-transferido { background: #fef3c7; color: #92400e; }
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
            <div class="subtitle">Tabla de Artículos - Vista ${vistaActivos === 'activos' ? 'Activos' : vistaActivos === 'transferidos' ? 'Transferidos' : 'Todos'}</div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <div><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-ES')}</div>
          </div>
        </div>
        
        <div class="info-box">
          <div class="filters">
            <strong>Filtros aplicados:</strong>
            ${filtro ? `<span class="filter-item">🔍 Búsqueda: "${filtro}"</span>` : ''}
            ${categoriaFiltro ? `<span class="filter-item">📁 Categoría: ${categoriaFiltro}</span>` : ''}
            ${lugarFiltro ? `<span class="filter-item">📍 Lugar: ${lugarFiltro}</span>` : ''}
            ${marcaFiltro ? `<span class="filter-item">🏷️ Marca: ${marcaFiltro}</span>` : ''}
            ${estadoFiltro ? `<span class="filter-item">⚡ Estado: ${estadoFiltro}</span>` : ''}
            ${!filtro && !categoriaFiltro && !lugarFiltro && !marcaFiltro && !estadoFiltro ? '<span class="filter-item">Sin filtros</span>' : ''}
          </div>
          <div class="stats">
            <div>Total: ${articulosFiltrados.length} artículo${articulosFiltrados.length !== 1 ? 's' : ''}</div>
            <div style="color: #059669;">Valor: $${valorTotal.toFixed(2)}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">Código</th>
              <th style="width: 22%;">Nombre</th>
              <th style="width: 10%;">Serie</th>
              <th style="width: 6%;">Cant.</th>
              <th style="width: 10%;">Precio</th>
              <th style="width: 8%;">Estado</th>
              <th style="width: 12%;">Categoría</th>
              <th style="width: 12%;">Marca</th>
              <th style="width: 12%;">Lugar</th>
            </tr>
          </thead>
          <tbody>
            ${articulosFiltrados.map(art => {
              const precioNum = Number(art.precioUnitario || art.precio_unitario || 0);
              const cantidad = art.cantidad || 0;
              const subtotal = precioNum * cantidad;
              
              let estadoBadge = 'badge';
              if (art.estado === 'Activo') estadoBadge += ' badge-active';
              else if (art.estado === 'Transferido') estadoBadge += ' badge-transferido';
              else estadoBadge += ' badge-inactive';
              
              return `
                <tr>
                  <td><strong>${art.codigo}</strong></td>
                  <td>${art.nombre}</td>
                  <td>${art.serie || 'N/A'}</td>
                  <td style="text-align: center;">${cantidad}</td>
                  <td style="text-align: right;">
                    <div>$${precioNum.toFixed(2)}</div>
                    <div style="font-size: 8px; color: #666;">Total: $${subtotal.toFixed(2)}</div>
                  </td>
                  <td><span class="${estadoBadge}">${art.estado}</span></td>
                  <td>${art.categoria || 'N/A'}</td>
                  <td>${art.marca || 'N/A'}</td>
                  <td>${art.lugar || 'N/A'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Activos Greenfield</strong> - Sistema de Gestión de Inventario</p>
          <p style="margin-top: 5px;">Este documento fue generado automáticamente y refleja los datos actuales del sistema</p>
        </div>
        
        <script>
          window.onload = function() { 
            setTimeout(function() { 
              window.print(); 
            }, 500); 
          }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
    setModalReporteAbierto(false);
  };

  const guardarCambios = async () => {
    if (!articuloSeleccionado) return;
    
    showLoading();
    try {
      // Obtener la fecha en formato correcto
      let fechaAdq = articuloSeleccionado.fechaAdquisicion || articuloSeleccionado.fecha_adquisicion;
      if (fechaAdq && fechaAdq.includes('T')) {
        fechaAdq = fechaAdq.split('T')[0];
      }
      
      const datosActualizados = {
        nombre: String(datosEdicion.nombre || '').trim(),
        descripcion: String(datosEdicion.descripcion || '').trim(),
        fechaAdquisicion: fechaAdq,
        serie: String(datosEdicion.serie || '').trim(),
        cantidad: parseInt(datosEdicion.cantidad) || 0,
        precioUnitario: parseFloat(datosEdicion.precioUnitario) || 0,
        estado: datosEdicion.estado,
        constancia: datosEdicion.constancia,
        numeroConstancia: datosEdicion.numeroConstancia,
        categoriaId: datosEdicion.categoriaId,
        lugarId: datosEdicion.lugarId,
        marcaId: datosEdicion.marcaId,
        proveedorId: datosEdicion.proveedorId,
        imagen: articuloSeleccionado.imagen
      };
      
      console.log('Enviando:', datosActualizados);
      
      await articuloService.update(articuloSeleccionado.id, datosActualizados);
      
      // Recargar datos primero
      await cargarDatos();
      
      // Cerrar modal
      setModoEdicion(false);
      setModalAbierto(false);
      setArticuloSeleccionado(null);
      setDatosEdicion({});
      
      hideLoading();
      
      // Mostrar toast después de cerrar el modal
      toast.success('Cambios guardados', 'El artículo ha sido actualizado exitosamente');
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      hideLoading();
      toast.error('Error al actualizar', error.message || 'No se pudo actualizar el artículo');
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Lista de Artículos"
        description="Gestiona y visualiza todos los artículos registrados"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Artículos Registrados ({totalArticulos})
            </h2>
            <Link
              href="/admin/articulos/registrar"
              className="rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
            >
              + Registrar Artículo
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-8 shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">Filtros</h3>
              <button
                onClick={() => setModalReporteAbierto(true)}
                className="flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-all"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar Reporte
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Categoría</label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Lugar</label>
                <select
                  value={lugarFiltro}
                  onChange={(e) => setLugarFiltro(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                >
                  <option value="">Todos los lugares</option>
                  {lugares.map(lugar => (
                    <option key={lugar.id} value={lugar.nombre}>{lugar.nombre} ({lugar.iniciales})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Marca</label>
                <select
                  value={marcaFiltro}
                  onChange={(e) => setMarcaFiltro(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map(marca => (
                    <option key={marca.id} value={marca.nombre}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Estado</label>
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary"
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

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <button
              onClick={() => setVistaActivos('activos')}
              className={`shadow-three rounded-lg p-6 transition-all ${
                vistaActivos === 'activos'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-dark dark:border dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              <p className={`text-sm ${vistaActivos === 'activos' ? 'text-white/80' : 'text-body-color dark:text-body-color-dark'}`}>
                Artículos Activos
              </p>
              <p className={`text-3xl font-bold ${vistaActivos === 'activos' ? 'text-white' : 'text-green-600'}`}>
                {articulos.filter(a => a.activo !== false && a.estado !== 'Transferido').length}
              </p>
            </button>
            <button
              onClick={() => setVistaActivos('transferidos')}
              className={`shadow-three rounded-lg p-6 transition-all ${
                vistaActivos === 'transferidos'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-dark dark:border dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              <p className={`text-sm ${vistaActivos === 'transferidos' ? 'text-white/80' : 'text-body-color dark:text-body-color-dark'}`}>
                Artículos Transferidos
              </p>
              <p className={`text-3xl font-bold ${vistaActivos === 'transferidos' ? 'text-white' : 'text-orange-600'}`}>
                {articulos.filter(a => a.activo === false || a.estado === 'Transferido').length}
              </p>
            </button>
            <button
              onClick={() => setVistaActivos('todos')}
              className={`shadow-three rounded-lg p-6 transition-all ${
                vistaActivos === 'todos'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-dark dark:border dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              <p className={`text-sm ${vistaActivos === 'todos' ? 'text-white/80' : 'text-body-color dark:text-body-color-dark'}`}>
                Todos los Artículos
              </p>
              <p className={`text-3xl font-bold ${vistaActivos === 'todos' ? 'text-white' : 'text-blue-600'}`}>
                {articulos.length}
              </p>
            </button>
          </div>

          <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white dark:border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Código</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Lugar</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Cantidad</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-black dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-body-color dark:text-body-color-dark">
                        No se encontraron artículos
                      </td>
                    </tr>
                  ) : (
                    articulosFiltrados.map((articulo, index) => (
                      <tr 
                        key={articulo.id}
                        className={`border-b border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-gray-dark" : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-800 dark:text-gray-300 font-medium">
                              {articulo.codigo}
                            </p>
                            {articulo.serie && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Serie: {articulo.serie}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {articulo.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                          {articulo.categoria}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                          {articulo.lugar}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300 font-semibold">
                          {articulo.cantidad}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              articulo.estado === "Excelente"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : articulo.estado === "Bueno"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : articulo.estado === "Regular"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : articulo.estado === "Transferido"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {articulo.estado}
                            {(articulo.activo === false || articulo.estado === 'Transferido') && ' (Inactivo)'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => abrirModal(articulo)}
                              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                              title="Ver detalles"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                abrirModal(articulo);
                                setModoEdicion(true);
                              }}
                              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all shadow-sm hover:shadow-md"
                              title="Editar"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={intentarEliminarArticulo}
                              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                              title="Información sobre eliminación"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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

      {modalAbierto && articuloSeleccionado && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-lg bg-white dark:bg-gray-dark shadow-2xl flex flex-col md:flex-row">
            
            <div className="md:w-2/5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-6">
              {articuloSeleccionado.imagen ? (
                <img
                  src={articuloSeleccionado.imagen}
                  alt={articuloSeleccionado.nombre}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                  <p>Sin imagen</p>
                </div>
              )}
            </div>

            <div className="md:w-3/5 flex flex-col">
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                    {articuloSeleccionado.nombre}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-mono font-semibold">{articuloSeleccionado.codigo}</span>
                    {articuloSeleccionado.serie && (
                      <>
                        <span>•</span>
                        <span>Serie: {articuloSeleccionado.serie}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        articuloSeleccionado.estado === "Excelente"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : articuloSeleccionado.estado === "Bueno"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : articuloSeleccionado.estado === "Regular"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : articuloSeleccionado.estado === "Transferido"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {articuloSeleccionado.estado}
                      {(articuloSeleccionado.activo === false || articuloSeleccionado.estado === 'Transferido') && ' (Inactivo)'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ml-4"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* INFORMACIÓN PRINCIPAL - SELECTORES EN MODO EDICIÓN */}
                <div className="mb-6 border-l-4 border-primary bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Información Principal</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">LUGAR</p>
                      {modoEdicion ? (
                        <select
                          value={datosEdicion.lugarId || ''}
                          onChange={(e) => setDatosEdicion({...datosEdicion, lugarId: parseInt(e.target.value)})}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                        >
                          <option value="">Seleccionar lugar</option>
                          {lugares.map(lugar => (
                            <option key={lugar.id} value={lugar.id}>{lugar.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-base font-bold text-gray-900 dark:text-white">{articuloSeleccionado.lugar}</p>
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">PROVEEDOR</p>
                      {modoEdicion ? (
                        <select
                          value={datosEdicion.proveedorId || ''}
                          onChange={(e) => setDatosEdicion({...datosEdicion, proveedorId: parseInt(e.target.value) || null})}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                        >
                          <option value="">Sin proveedor</option>
                          {proveedores.map(proveedor => (
                            <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-base font-bold text-gray-900 dark:text-white">{articuloSeleccionado.proveedor || 'N/A'}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">MARCA</p>
                        {modoEdicion ? (
                          <select
                            value={datosEdicion.marcaId || ''}
                            onChange={(e) => setDatosEdicion({...datosEdicion, marcaId: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                          >
                            <option value="">Seleccionar marca</option>
                            {marcas.map(marca => (
                              <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{articuloSeleccionado.marca}</p>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">CATEGORÍA</p>
                        {modoEdicion ? (
                          <select
                            value={datosEdicion.categoriaId || ''}
                            onChange={(e) => setDatosEdicion({...datosEdicion, categoriaId: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                          >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(categoria => (
                              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{articuloSeleccionado.categoria}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nombre */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Artículo
                  </label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      value={datosEdicion.nombre || ''}
                      onChange={(e) => setDatosEdicion({...datosEdicion, nombre: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-black dark:text-white">{articuloSeleccionado.nombre}</p>
                  )}
                </div>

                {/* Código y Serie */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Código</label>
                    <p className="font-mono font-semibold text-black dark:text-white">{articuloSeleccionado.codigo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Serie</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={datosEdicion.serie || ''}
                        onChange={(e) => setDatosEdicion({...datosEdicion, serie: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-black dark:text-white">{articuloSeleccionado.serie || '-'}</p>
                    )}
                  </div>
                </div>

                {/* Estado y Cantidad */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    {modoEdicion ? (
                      <select
                        value={datosEdicion.estado || ''}
                        onChange={(e) => setDatosEdicion({...datosEdicion, estado: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          articuloSeleccionado.estado === "Excelente"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : articuloSeleccionado.estado === "Bueno"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : articuloSeleccionado.estado === "Regular"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {articuloSeleccionado.estado}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cantidad</label>
                    {modoEdicion ? (
                      <input
                        type="number"
                        value={datosEdicion.cantidad || 0}
                        onChange={(e) => setDatosEdicion({...datosEdicion, cantidad: parseInt(e.target.value) || 0})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-xl font-bold text-primary">{articuloSeleccionado.cantidad}</p>
                    )}
                  </div>
                </div>

                {/* Precio Unitario */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Precio Unitario</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      step="0.01"
                      value={datosEdicion.precioUnitario || 0}
                      onChange={(e) => setDatosEdicion({...datosEdicion, precioUnitario: parseFloat(e.target.value) || 0})}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-black dark:text-white">
                      Bs. {Number(articuloSeleccionado.precioUnitario ?? articuloSeleccionado.precio_unitario ?? 0).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  {modoEdicion ? (
                    <textarea
                      value={datosEdicion.descripcion || ''}
                      onChange={(e) => setDatosEdicion({...datosEdicion, descripcion: e.target.value})}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {articuloSeleccionado.descripcion || '-'}
                    </p>
                  )}
                </div>

                {/* Precio Total - Destacado */}
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase">Precio Total</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    Bs. {(Number(articuloSeleccionado.precioUnitario ?? articuloSeleccionado.precio_unitario ?? 0) * Number(articuloSeleccionado.cantidad ?? 0)).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {articuloSeleccionado.cantidad} × Bs. {Number(articuloSeleccionado.precioUnitario ?? articuloSeleccionado.precio_unitario ?? 0).toFixed(2)}
                  </p>
                </div>

                {/* Constancia */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase">Constancia</p>
                    {modoEdicion ? (
                      <select
                        value={datosEdicion.constancia || 'Proforma'}
                        onChange={(e) => setDatosEdicion({...datosEdicion, constancia: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                      >
                        <option value="Proforma">Proforma</option>
                        <option value="Factura">Factura</option>
                        <option value="Recibo">Recibo</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-black dark:text-white">{articuloSeleccionado.constancia || 'Proforma'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase">Nro. Constancia</p>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={datosEdicion.numeroConstancia || ''}
                        onChange={(e) => setDatosEdicion({...datosEdicion, numeroConstancia: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-black dark:text-white focus:border-primary focus:outline-none"
                        placeholder="N/A"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-black dark:text-white">{articuloSeleccionado.numeroConstancia || articuloSeleccionado.numero_constancia || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center">
                  {!modoEdicion && (
                    <button
                      onClick={() => {
                        intentarEliminarArticulo();
                      }}
                      className="rounded-lg bg-red-500 hover:bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-all"
                    >
                      Eliminar
                    </button>
                  )}
                  <div className={`flex gap-3 ${modoEdicion ? 'w-full justify-end' : ''}`}>
                    {modoEdicion ? (
                      <>
                        <button
                          onClick={() => {
                            setModoEdicion(false);
                            setDatosEdicion({
                              nombre: articuloSeleccionado.nombre,
                              descripcion: articuloSeleccionado.descripcion || '',
                              cantidad: articuloSeleccionado.cantidad,
                              estado: articuloSeleccionado.estado,
                              serie: articuloSeleccionado.serie || '',
                              precioUnitario: articuloSeleccionado.precioUnitario || articuloSeleccionado.precio_unitario || 0,
                              categoriaId: articuloSeleccionado.categoriaId || articuloSeleccionado.categoria_id,
                              lugarId: articuloSeleccionado.lugarId || articuloSeleccionado.lugar_id,
                              marcaId: articuloSeleccionado.marcaId || articuloSeleccionado.marca_id,
                              proveedorId: articuloSeleccionado.proveedorId || articuloSeleccionado.proveedor_id,
                              constancia: articuloSeleccionado.constancia || 'Proforma',
                              numeroConstancia: articuloSeleccionado.numeroConstancia || articuloSeleccionado.numero_constancia || '',
                            });
                          }}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={guardarCambios}
                          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
                        >
                          Guardar Cambios
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={cerrarModal}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cerrar
                        </button>
                        <button
                          onClick={() => setModoEdicion(true)}
                          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reporte */}
      {modalReporteAbierto && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl rounded-lg bg-white dark:bg-gray-dark shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-5">
              <div>
                <h3 className="text-2xl font-bold text-black dark:text-white">
                  Generar Reporte
                </h3>
                <p className="mt-1 text-sm text-body-color">
                  Selecciona el tipo de reporte que deseas generar
                </p>
              </div>
              <button
                onClick={() => setModalReporteAbierto(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Info Box */}
              <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Artículos filtrados: <strong>{articulosFiltrados.length}</strong>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Vista: <strong>{vistaActivos === 'activos' ? 'Activos' : vistaActivos === 'transferidos' ? 'Transferidos' : 'Todos'}</strong>
                      {(filtro || categoriaFiltro || lugarFiltro || marcaFiltro || estadoFiltro) && ' • Con filtros aplicados'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones de Reporte */}
              <div className="grid grid-cols-1 gap-4">
                {/* Opción 1: Imprimir Tabla */}
                <button
                  onClick={imprimirTablaFiltrada}
                  className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 dark:from-primary/10 dark:to-primary/20 dark:hover:from-primary/20 dark:hover:to-primary/30 p-5 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary p-3 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-black dark:text-white mb-1">
                        Imprimir Tabla Filtrada
                      </h4>
                      <p className="text-sm text-body-color mb-2">
                        Imprime la tabla con los filtros actuales aplicados. Incluye códigos, nombres, series, cantidades, precios y más.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-primary font-medium">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Rápido • Vista previa • Filtros aplicados</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-white/50 dark:bg-black/30 p-2 group-hover:bg-white/80 dark:group-hover:bg-black/50 transition-colors">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Opciones PDF y Excel en Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Opción 2: PDF Personalizado */}
                  <button
                    onClick={generarReportePDF}
                    className="group relative overflow-hidden rounded-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:hover:from-red-800/30 dark:hover:to-red-700/30 p-4 text-left transition-all duration-300 hover:border-red-400 hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="rounded-lg bg-red-600 p-3 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-black dark:text-white mb-1">
                          Reporte PDF
                        </h4>
                        <p className="text-xs text-body-color">
                          Documento profesional con columnas personalizables
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Opción 3: Excel/CSV */}
                  <button
                    onClick={generarReporteExcel}
                    className="group relative overflow-hidden rounded-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-800/30 dark:hover:to-green-700/30 p-4 text-left transition-all duration-300 hover:border-green-400 hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="rounded-lg bg-green-600 p-3 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-black dark:text-white mb-1">
                          Exportar Excel
                        </h4>
                        <p className="text-xs text-body-color">
                          Archivo CSV para análisis de datos
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-body-color">
                💡 Tip: Los reportes incluyen todos los filtros aplicados
              </p>
              <button
                onClick={() => setModalReporteAbierto(false)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo sobre Eliminación */}
      <InfoModal
        isOpen={modalInfo}
        title="Política de Auditoría"
        message="Los artículos registrados no pueden ser eliminados del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de activos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaArticulosPage;
