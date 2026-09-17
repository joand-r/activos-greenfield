"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { proveedorService, Proveedor } from "@/services/proveedor.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalCrearEditarProveedor } from "@/components/modals/catalogos/ModalCrearEditarProveedor";

const ListaProveedoresPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();
  
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  
  // Modales
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [modalInfo, setModalInfo] = useState(false);

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    nit: ""
  });

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    nit: ""
  });

  useEffect(() => {
    document.title = "Lista de Proveedores | Activos Greenfield";
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    showLoading();
    try {
      const data = await proveedorService.getAll();
      setProveedores(data || []);
    } catch (error: any) {
      console.error("Error al cargar proveedores:", error);
      setError(error.message || "Error al cargar los proveedores");
      setProveedores([]);
    } finally {
      hideLoading();
    }
  };

  const intentarEliminar = () => {
    setModalInfo(true);
  };

  // Controladores de Edición
  const abrirModalEdicion = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setDatosEdicion({
      nombre: proveedor.nombre,
      nit: proveedor.nit
    });
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setProveedorSeleccionado(null);
    setDatosEdicion({ nombre: "", nit: "" });
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorSeleccionado) return;

    if (!datosEdicion.nombre.trim() || !datosEdicion.nit.trim()) {
      toast.error("Error", "Todos los campos son obligatorios");
      return;
    }
    
    showLoading();
    try {
      await proveedorService.update(proveedorSeleccionado.id, datosEdicion);
      await cargarProveedores();
      cerrarModalEdicion();
      hideLoading();
      toast.success("Actualización Exitosa", "Proveedor actualizado correctamente");
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      hideLoading();
      toast.error("Error al actualizar", error.message || "No se pudo actualizar el proveedor");
    }
  };

  // Controladores de Registro
  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "", nit: "" });
    setModalRegistroAbierto(true);
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setDatosRegistro({ nombre: "", nit: "" });
  };

  const registrarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!datosRegistro.nombre.trim() || !datosRegistro.nit.trim()) {
      toast.error("Error", "Todos los campos son obligatorios");
      return;
    }

    showLoading();
    try {
      await proveedorService.create(datosRegistro);
      await cargarProveedores();
      cerrarModalRegistro();
      hideLoading();
      toast.success("Registro Exitoso", "Proveedor registrado correctamente");
    } catch (error: any) {
      console.error("Error al registrar proveedor:", error);
      hideLoading();
      toast.error("Error al registrar", error.message || "No se pudo registrar el proveedor");
    }
  };

  const proveedoresFiltrados = (proveedores || []).filter((prov) =>
    prov?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    prov?.nit?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Breadcrumb
        pageName="Lista de Proveedores"
        description="Gestiona los proveedores de bienes y servicios de la empresa"
      />

      <section className="pb-12 text-xs">
        <div className="container mx-auto">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Barra de Acciones */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Buscar por nombre o NIT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={abrirModalRegistro}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proveedor
            </button>
          </div>

          {/* Tabla de Proveedores */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Nombre / Razón Social
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      NIT / Documento
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {proveedoresFiltrados.map((prov) => (
                    <tr
                      key={prov.id}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                        #{prov.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-black dark:text-white">
                        {prov.nombre}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                        {prov.nit}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => abrirModalEdicion(prov)}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                            title="Editar Proveedor"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={intentarEliminar}
                            className="group relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all text-white shadow-sm hover:shadow-md cursor-pointer"
                            title="Eliminar Proveedor"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {proveedoresFiltrados.length === 0 && (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                No se encontraron proveedores registrados con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      <ModalCrearEditarProveedor
        isOpen={modalRegistroAbierto}
        modoEdicion={false}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={registrarProveedor}
        onClose={cerrarModalRegistro}
      />

      {/* Modal de Edición */}
      <ModalCrearEditarProveedor
        isOpen={modalEdicionAbierto}
        modoEdicion={true}
        proveedor={proveedorSeleccionado}
        formData={datosEdicion}
        setFormData={setDatosEdicion}
        onSubmit={guardarCambios}
        onClose={cerrarModalEdicion}
      />

      {/* Modal Informativo sobre Eliminación */}
      <InfoModal
        isOpen={modalInfo}
        title="Política de Auditoría"
        message="Los proveedores registrados no pueden ser eliminados del sistema debido a requisitos de auditoría y trazabilidad de la empresa. Todos los registros deben mantenerse para cumplir con las normativas internas y garantizar la transparencia en la gestión de datos."
        confirmText="Entendido"
        icon="shield"
        onClose={() => setModalInfo(false)}
      />
    </>
  );
};

export default ListaProveedoresPage;
