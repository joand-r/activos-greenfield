"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import InfoModal from "@/components/InfoModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { useToast } from "@/contexts/ToastContext";
import { vehiculoService, Vehiculo } from "@/services/vehiculo.service";
import { lugarService } from "@/services/lugar.service";
import { marcaService } from "@/services/marca.service";

const ListaVehiculosPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [lugares, setLugares] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<any>({});
  const [filtro, setFiltro] = useState("");
  const [lugarFiltro, setLugarFiltro] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [vistaActivos, setVistaActivos] = useState<'activos' | 'transferidos' | 'todos'>('activos');
  const [error, setError] = useState("");
  
  // Estados para modal informativo
  const [modalInfo, setModalInfo] = useState(false);

  useEffect(() => {
    document.title = "Lista de Vehículos | Activos Greenfield";
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaActivos]);

  const cargarDatos = async () => {
    showLoading();
    try {
      const params = { incluirInactivos: 'true' };
      const [vehiculosData, lugaresData, marcasData] = await Promise.all([
        vehiculoService.getAll(params),
        lugarService.getAll(),
        marcaService.getAll(),
      ]);
      setVehiculos(vehiculosData);
      setLugares(lugaresData);
      setMarcas(marcasData);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      setError(error.message || "Error al cargar los datos");
    } finally {
      hideLoading();
    }
  };

  const intentarEliminarVehiculo = () => {
    setModalInfo(true);
  };

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const matchFiltro = vehiculo.placa?.toLowerCase().includes(filtro.toLowerCase()) ||
                        vehiculo.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
                        vehiculo.modelo?.toLowerCase().includes(filtro.toLowerCase());
    const matchLugar = lugarFiltro === "" || vehiculo.lugar === lugarFiltro;
    const matchMarca = marcaFiltro === "" || vehiculo.marca === marcaFiltro;
    const matchEstado = estadoFiltro === "" || vehiculo.estado === estadoFiltro;
    
    // Filtro por vista
    if (vistaActivos === 'activos') {
      return matchFiltro && matchLugar && matchMarca && matchEstado && vehiculo.activo !== false && vehiculo.estado !== 'Transferido';
    } else if (vistaActivos === 'transferidos') {
      return matchFiltro && matchLugar && matchMarca && matchEstado && (vehiculo.activo === false || vehiculo.estado === 'Transferido');
    } else {
      return matchFiltro && matchLugar && matchMarca && matchEstado;
    }
  });

  // Calcular totales
  const totalVehiculos = vehiculosFiltrados.length;

  const abrirModal = (vehiculo: Vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setDatosEdicion({
      placa: vehiculo.placa,
      modelo: vehiculo.modelo,
      chasis: vehiculo.chasis,
      color: vehiculo.color,
      descripcion: vehiculo.descripcion || '',
      estado: vehiculo.estado,
      lugarId: vehiculo.lugarId || vehiculo.lugar_id,
      marcaId: vehiculo.marcaId || vehiculo.marca_id,
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVehiculoSeleccionado(null);
    setModoEdicion(false);
    setDatosEdicion({});
  };

  const imprimirTablaFiltrada = () => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;
    
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tabla de Vehículos Filtrados</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ACTIVOS GREENFIELD</div>
            <div class="subtitle">Tabla de Vehículos - Vista ${vistaActivos === 'activos' ? 'Activos' : vistaActivos === 'transferidos' ? 'Transferidos' : 'Todos'}</div>
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
            ${lugarFiltro ? `<span class="filter-item">📍 Lugar: ${lugarFiltro}</span>` : ''}
            ${marcaFiltro ? `<span class="filter-item">🏷️ Marca: ${marcaFiltro}</span>` : ''}
            ${estadoFiltro ? `<span class="filter-item">⚡ Estado: ${estadoFiltro}</span>` : ''}
            ${!filtro && !lugarFiltro && !marcaFiltro && !estadoFiltro ? '<span class="filter-item">Sin filtros</span>' : ''}
          </div>
          <div class="stats">
            <div>Total: ${vehiculosFiltrados.length} vehículo${vehiculosFiltrados.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Código</th>
              <th style="width: 12%;">Placa</th>
              <th style="width: 18%;">Modelo</th>
              <th style="width: 15%;">Chasis</th>
              <th style="width: 10%;">Color</th>
              <th style="width: 10%;">Estado</th>
              <th style="width: 12%;">Marca</th>
              <th style="width: 13%;">Lugar</th>
            </tr>
          </thead>
          <tbody>
            ${vehiculosFiltrados.map(veh => {
              let estadoBadge = 'badge';
              if (veh.estado === 'Activo') estadoBadge += ' badge-active';
              else if (veh.estado === 'Transferido') estadoBadge += ' badge-transferido';
              else estadoBadge += ' badge-inactive';
              
              return `
                <tr>
                  <td><strong>${veh.codigo}</strong></td>
                  <td><strong>${veh.placa}</strong></td>
                  <td>${veh.modelo}</td>
                  <td>${veh.chasis || 'N/A'}</td>
                  <td>${veh.color}</td>
                  <td><span class="${estadoBadge}">${veh.estado}</span></td>
                  <td>${veh.marca || 'N/A'}</td>
                  <td>${veh.lugar || 'N/A'}</td>
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
  };

  const guardarCambios = async () => {
    if (!vehiculoSeleccionado) return;
    
    showLoading();
    try {
      const dataToUpdate = {
        placa: datosEdicion.placa,
        modelo: datosEdicion.modelo,
        chasis: datosEdicion.chasis,
        color: datosEdicion.color,
        descripcion: datosEdicion.descripcion,
        estado: datosEdicion.estado,
        lugarId: parseInt(datosEdicion.lugarId),
        marcaId: parseInt(datosEdicion.marcaId),
      };

      await vehiculoService.update(vehiculoSeleccionado.id, dataToUpdate);
      toast.showToast("Vehículo actualizado exitosamente", "success");
      cerrarModal();
      cargarDatos();
    } catch (error: any) {
      console.error("Error al actualizar vehículo:", error);
      toast.showToast(error.message || "Error al actualizar el vehículo", "error");
    } finally {
      hideLoading();
    }
  };

  const handleChangeDatosEdicion = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatosEdicion((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const estados = ["Nuevo", "Medio Uso", "Fregado", "En Reparación", "Obsoleto", "Transferido"];

  return (
    <>
      <Breadcrumb
        pageName="Lista de Vehículos"
        description="Gestiona los vehículos registrados en el sistema"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          {/* Estadísticas y acciones */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-6 shadow-three dark:bg-gray-dark">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-body-color dark:text-body-color-dark">Total Vehículos</p>
                <p className="text-3xl font-bold text-primary">{totalVehiculos}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/vehiculos/registrar"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Vehículo
              </Link>
              
              <button
                onClick={imprimirTablaFiltrada}
                className="inline-flex items-center gap-2 rounded-sm bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>

          {/* Filtros y tabs de vista */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-three dark:bg-gray-dark">
            {/* Tabs de vista */}
            <div className="mb-6 flex gap-3 border-b border-stroke pb-3 dark:border-strokedark">
              <button
                onClick={() => setVistaActivos('activos')}
                className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                  vistaActivos === 'activos'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-body-color hover:bg-gray-200 dark:bg-gray-800 dark:text-body-color-dark'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setVistaActivos('transferidos')}
                className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                  vistaActivos === 'transferidos'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-body-color hover:bg-gray-200 dark:bg-gray-800 dark:text-body-color-dark'
                }`}
              >
                Transferidos
              </button>
              <button
                onClick={() => setVistaActivos('todos')}
                className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                  vistaActivos === 'todos'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-body-color hover:bg-gray-200 dark:bg-gray-800 dark:text-body-color-dark'
                }`}
              >
                Todos
              </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Código, placa o modelo..."
                  className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-4 py-2 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Lugar
                </label>
                <select
                  value={lugarFiltro}
                  onChange={(e) => setLugarFiltro(e.target.value)}
                  className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-4 py-2 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                >
                  <option value="">Todos los lugares</option>
                  {lugares.map((lugar) => (
                    <option key={lugar.id} value={lugar.nombre}>
                      {lugar.nombre}
                    </option>
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
                  className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-4 py-2 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.nombre}>
                      {marca.nombre}
                    </option>
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
                  className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-4 py-2 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de vehículos */}
          <div className="rounded-lg bg-white shadow-three dark:bg-gray-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Código
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Placa
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Modelo
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Chasis
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Color
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Estado
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Marca
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Lugar
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-body-color dark:text-body-color-dark">
                        No se encontraron vehículos
                      </td>
                    </tr>
                  ) : (
                    vehiculosFiltrados.map((vehiculo) => (
                      <tr key={vehiculo.id} className="border-b border-[#eee] dark:border-strokedark">
                        <td className="px-4 py-5 pl-9 xl:pl-11">
                          <p className="font-medium text-black dark:text-white">{vehiculo.codigo}</p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="font-medium text-primary">{vehiculo.placa}</p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-black dark:text-white">{vehiculo.modelo}</p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-sm text-body-color dark:text-body-color-dark">
                            {vehiculo.chasis || 'N/A'}
                          </p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-black dark:text-white">{vehiculo.color}</p>
                        </td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                            vehiculo.estado === 'Nuevo'
                              ? 'bg-success text-success'
                              : vehiculo.estado === 'Medio Uso'
                              ? 'bg-warning text-warning'
                              : vehiculo.estado === 'Transferido'
                              ? 'bg-danger text-danger'
                              : 'bg-primary text-primary'
                          }`}>
                            {vehiculo.estado}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-black dark:text-white">{vehiculo.marca || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-black dark:text-white">{vehiculo.lugar || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-5">
                          <button
                            onClick={() => abrirModal(vehiculo)}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            Ver
                          </button>
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

      {/* Modal de detalles */}
      {modalAbierto && vehiculoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8 dark:bg-gray-dark">
            <button
              onClick={cerrarModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
              {modoEdicion ? 'Editar Vehículo' : 'Detalles del Vehículo'}
            </h2>

            {vehiculoSeleccionado.imagen && (
              <div className="mb-6 flex justify-center">
                <img
                  src={vehiculoSeleccionado.imagen}
                  alt={vehiculoSeleccionado.placa}
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}

            {modoEdicion ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Placa</label>
                    <input
                      type="text"
                      name="placa"
                      value={datosEdicion.placa}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Modelo</label>
                    <input
                      type="text"
                      name="modelo"
                      value={datosEdicion.modelo}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Chasis</label>
                    <input
                      type="text"
                      name="chasis"
                      value={datosEdicion.chasis}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={datosEdicion.color}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Estado</label>
                    <select
                      name="estado"
                      value={datosEdicion.estado}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    >
                      {estados.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Marca</label>
                    <select
                      name="marcaId"
                      value={datosEdicion.marcaId}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    >
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Lugar</label>
                    <select
                      name="lugarId"
                      value={datosEdicion.lugarId}
                      onChange={handleChangeDatosEdicion}
                      className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                    >
                      {lugares.map((lugar) => (
                        <option key={lugar.id} value={lugar.id}>{lugar.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={datosEdicion.descripcion}
                    onChange={handleChangeDatosEdicion}
                    rows={3}
                    className="w-full rounded border border-stroke bg-gray px-4 py-2 dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Código</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Placa</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.placa}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Modelo</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Chasis</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.chasis}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Color</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.color}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Estado</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Marca</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.marca || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">Lugar</p>
                  <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.lugar || 'N/A'}</p>
                </div>
                {vehiculoSeleccionado.descripcion && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-body-color dark:text-body-color-dark">Descripción</p>
                    <p className="font-medium text-black dark:text-white">{vehiculoSeleccionado.descripcion}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {modoEdicion ? (
                <>
                  <button
                    onClick={guardarCambios}
                    className="rounded-sm bg-primary px-6 py-2 text-white hover:bg-primary/90"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setModoEdicion(false)}
                    className="rounded-sm bg-gray-300 px-6 py-2 text-dark hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="rounded-sm bg-primary px-6 py-2 text-white hover:bg-primary/90"
                  >
                    Editar
                  </button>
                  <button
                    onClick={intentarEliminarVehiculo}
                    className="rounded-sm bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal informativo */}
      <InfoModal
        isOpen={modalInfo}
        onClose={() => setModalInfo(false)}
        title="Eliminación no disponible"
        message="Por seguridad, no se puede eliminar un vehículo directamente. Si necesitas marcar un vehículo como inactivo o transferirlo, por favor edita su estado o realiza una transferencia."
      />
    </>
  );
};

export default ListaVehiculosPage;
