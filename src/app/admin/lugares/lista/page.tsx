"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { lugarService, Lugar, TipoLugar } from "@/services/lugar.service";
import InfoModal from "@/components/ui/InfoModal";
import { useToast } from "@/contexts/ToastContext";
import { ModalCrearEditarLugar } from "@/components/modals/catalogos/ModalCrearEditarLugar";
import { useModalState, useDataTable } from "@/hooks";
import { PaginationControl } from "@/components/ui/PaginationControl";

const ListaLugaresPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [error, setError] = useState("");

  // Modales gestionados con useModalState
  const modalEdicion = useModalState<Lugar>();
  const modalRegistro = useModalState();
  const modalInfo = useModalState();

  // Estados de formulario
  const [datosEdicion, setDatosEdicion] = useState({
    nombre: "",
    inicial: "",
    tipo: "" as TipoLugar | "",
  });

  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    inicial: "",
    tipo: "" as TipoLugar | "",
  });

  const tiposLugar: { id: TipoLugar; nombre: string }[] = [
    { id: "VIVIENDA", nombre: "Vivienda" },
    { id: "OFICINA", nombre: "Oficina" },
    { id: "ALMACEN", nombre: "Almacén" },
    { id: "CENTER", nombre: "Center" },
    { id: "PROPIEDAD", nombre: "Propiedad" },
  ];

  // Hook DataTable para búsqueda con debounce, filtrado y paginación
  const {
    searchTerm: busqueda,
    setSearchTerm: setBusqueda,
    paginatedData: lugaresPaginados,
    totalFiltered,
    pagination,
  } = useDataTable<Lugar>({
    data: lugares,
    searchFields: ["nombre", "inicial"],
    pageSize: 10,
    filterFn: (lugar) => {
      if (filtroTipo && lugar.tipo !== filtroTipo) return false;
      return true;
    },
  });

  useEffect(() => {
    document.title = "Lista de Lugares | Activos Greenfield";
    cargarLugares();
  }, []);

  const cargarLugares = async () => {
    showLoading();
    try {
      const data = await lugarService.getAll();
      setLugares(data || []);
    } catch (err: any) {
      console.error("Error al cargar lugares:", err);
      setError(err.message || "Error al cargar los lugares");
      setLugares([]);
    } finally {
      hideLoading();
    }
  };

  // Controladores de Edición
  const abrirModalEdicion = (lugar: Lugar) => {
    setDatosEdicion({
      nombre: lugar.nombre,
      inicial: lugar.inicial,
      tipo: lugar.tipo as TipoLugar,
    });
    modalEdicion.open(lugar);
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicion.data) return;

    if (datosEdicion.inicial.length !== 3) {
      toast.error("Error", "Las iniciales deben tener exactamente 3 caracteres");
      return;
    }

    showLoading();
    try {
      await lugarService.update(modalEdicion.data.id, {
        nombre: datosEdicion.nombre,
        inicial: datosEdicion.inicial.toUpperCase(),
        tipo: datosEdicion.tipo as TipoLugar,
      });
      await cargarLugares();
      modalEdicion.close();
      toast.success("Actualización Exitosa", "Lugar actualizado correctamente");
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      toast.error("Error al actualizar", err.message || "No se pudo actualizar el lugar");
    } finally {
      hideLoading();
    }
  };

  // Controladores de Registro
  const abrirModalRegistro = () => {
    setDatosRegistro({ nombre: "", inicial: "", tipo: "" });
    modalRegistro.open();
  };

  const registrarLugar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (datosRegistro.inicial.length !== 3) {
      toast.error("Error", "Las iniciales deben tener exactamente 3 caracteres");
      return;
    }

    showLoading();
    try {
      await lugarService.create({
        nombre: datosRegistro.nombre,
        inicial: datosRegistro.inicial.toUpperCase(),
        tipo: datosRegistro.tipo as TipoLugar,
      });
      await cargarLugares();
      modalRegistro.close();
      toast.success("Registro Exitoso", "Lugar registrado correctamente");
    } catch (err: any) {
      console.error("Error al registrar lugar:", err);
      toast.error("Error al registrar", err.message || "No se pudo registrar el lugar");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Lista de Lugares"
        description="Gestiona las ubicaciones y lugares físicos de la empresa"
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
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Buscar por nombre o iniciales..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">Todos los tipos</option>
                  {tiposLugar.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={abrirModalRegistro}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Lugar
            </button>
          </div>

          {/* Tabla de Lugares */}
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
                      Iniciales
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {lugaresPaginados.length > 0 ? (
                    lugaresPaginados.map((lugar) => (
                      <tr
                        key={lugar.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                          #{lugar.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-black dark:text-white">
                          {lugar.nombre}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-primary">
                          {lugar.inicial}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-black dark:text-white">
                            {lugar.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEdicion(lugar)}
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
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron lugares con los filtros actuales.
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
              itemName="lugares"
            />
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      <ModalCrearEditarLugar
        isOpen={modalRegistro.isOpen}
        modoEdicion={false}
        tiposLugar={tiposLugar}
        formData={datosRegistro}
        setFormData={setDatosRegistro}
        onSubmit={registrarLugar}
        onClose={modalRegistro.close}
      />

      {/* Modal de Edición */}
      <ModalCrearEditarLugar
        isOpen={modalEdicion.isOpen}
        modoEdicion={true}
        tiposLugar={tiposLugar}
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
        message="Por motivos de auditoría y consistencia en el historial de activos, los lugares no pueden ser eliminados."
      />
    </>
  );
};

export default ListaLugaresPage;
