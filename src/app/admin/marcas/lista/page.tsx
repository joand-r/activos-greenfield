"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { marcaService, Marca } from "@/services/marca.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalCrearEditarMarca } from "@/components/modals/catalogos/ModalCrearEditarMarca";
import { useModalState, useDataTable } from "@/hooks";
import { PaginationControl } from "@/components/ui/PaginationControl";

const ListaMarcasPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [error, setError] = useState("");

  // Modales gestionados con useModalState
  const modalEdicion = useModalState<Marca>();
  const modalRegistro = useModalState();
  const modalInfo = useModalState();

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    descripcion: "",
  });

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    descripcion: "",
  });

  // Hook DataTable para búsqueda con debounce y paginación
  const {
    searchTerm: busqueda,
    setSearchTerm: setBusqueda,
    paginatedData: marcasPaginadas,
    totalFiltered,
    pagination,
  } = useDataTable<Marca>({
    data: marcas,
    searchFields: ["nombre", "descripcion"],
    pageSize: 10,
  });

  useEffect(() => {
    document.title = "Lista de Marcas | Activos Greenfield";
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    showLoading();
    try {
      const data = await marcaService.getAll();
      setMarcas(data || []);
    } catch (err: any) {
      console.error("Error al cargar marcas:", err);
      setError(err.message || "Error al cargar las marcas");
      setMarcas([]);
    } finally {
      hideLoading();
    }
  };

  // Controladores de Edición
  const abrirModalEdicion = (marca: Marca) => {
    setDatosEdicion({
      nombre: marca.nombre,
      descripcion: marca.descripcion || "",
    });
    modalEdicion.open(marca);
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicion.data) return;

    if (!datosEdicion.nombre.trim()) {
      toast.error("Error", "El nombre es obligatorio");
      return;
    }

    showLoading();
    try {
      await marcaService.update(modalEdicion.data.id, datosEdicion);
      await cargarMarcas();
      modalEdicion.close();
      toast.success("Actualización Exitosa", "Marca actualizada correctamente");
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      toast.error("Error al actualizar", err.message || "No se pudo actualizar la marca");
    } finally {
      hideLoading();
    }
  };

  // Controladores de Registro
  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "", descripcion: "" });
    modalRegistro.open();
  };

  const registrarMarca = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!datosRegistro.nombre.trim()) {
      toast.error("Error", "El nombre de la marca es obligatorio");
      return;
    }

    showLoading();
    try {
      await marcaService.create(datosRegistro);
      await cargarMarcas();
      modalRegistro.close();
      toast.success("Registro Exitoso", "Marca registrada correctamente");
    } catch (err: any) {
      console.error("Error al registrar marca:", err);
      toast.error("Error al registrar", err.message || "No se pudo registrar la marca");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Lista de Marcas"
        description="Gestiona las marcas del sistema"
      />

      <section className="pb-12 text-xs">
        <div className="container mx-auto">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Barra de Acciones y Filtros */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
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
              Nueva Marca
            </button>
          </div>

          {/* Tabla de Marcas */}
          <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {marcasPaginadas.length > 0 ? (
                    marcasPaginadas.map((marca) => (
                      <tr
                        key={marca.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                          #{marca.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-black dark:text-white">
                          {marca.nombre}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {marca.descripcion || "Sin descripción"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEdicion(marca)}
                              className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                              title="Editar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => modalInfo.open()}
                              className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron marcas con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <PaginationControl
              pagination={pagination}
              totalItems={totalFiltered}
              itemName="marcas"
            />
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      <ModalCrearEditarMarca
        isOpen={modalRegistro.isOpen}
        modoEdicion={false}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={registrarMarca}
        onClose={modalRegistro.close}
      />

      {/* Modal de Edición */}
      <ModalCrearEditarMarca
        isOpen={modalEdicion.isOpen}
        modoEdicion={true}
        formData={datosEdicion}
        setFormData={setDatosEdicion}
        onSubmit={guardarCambios}
        onClose={modalEdicion.close}
      />

      {/* Modal Informativo */}
      <InfoModal
        isOpen={modalInfo.isOpen}
        onClose={modalInfo.close}
        title="Acción no permitida"
        message="Por motivos de auditoría y consistencia en el historial de activos, las marcas no pueden ser eliminadas."
      />
    </>
  );
};

export default ListaMarcasPage;
