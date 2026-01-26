"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { movimientoService } from "@/services/movimiento.service";
import { articuloService, Articulo } from "@/services/articulo.service";
import { lugarService, Lugar } from "@/services/lugar.service";

const RegistrarMovimientoPage = () => {
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    document.title = "Registro de Movimiento | Activos Greenfield";
    cargarDatos();
  }, []);

  const [formData, setFormData] = useState({
    articuloId: "",
    lugarDestinoId: "",
    fechaMovimiento: new Date().toISOString().split('T')[0],
    motivo: "",
    responsable: "",
    observaciones: "",
  });

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cargarDatos = async () => {
    showLoading();
    try {
      const [articulosData, lugaresData] = await Promise.all([
        articuloService.getAll(),
        lugarService.getAll()
      ]);
      setArticulos(articulosData);
      setLugares(lugaresData);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      setError(error.message || "Error al cargar los datos");
    } finally {
      hideLoading();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const articuloSeleccionado = articulos.find(a => a.id === parseInt(formData.articuloId));
    
    if (!articuloSeleccionado) {
      setError("Selecciona un artículo válido");
      return;
    }
    
    if (articuloSeleccionado.lugar_id === parseInt(formData.lugarDestinoId)) {
      setError("El lugar de destino debe ser diferente al lugar actual del artículo");
      return;
    }
    
    setError("");
    setSuccess("");
    showLoading();
    
    try {
      const transferenciaData = {
        articuloId: parseInt(formData.articuloId),
        lugarDestinoId: parseInt(formData.lugarDestinoId),
        fechaMovimiento: formData.fechaMovimiento,
        motivo: formData.motivo,
        responsable: formData.responsable,
        observaciones: formData.observaciones,
      };
      
      const response = await movimientoService.crearTransferencia(transferenciaData);
      
      setSuccess(`✓ Transferencia exitosa: ${response.data.articuloOriginal.codigo} → ${response.data.articuloNuevo.codigo}`);
      
      setFormData({
        articuloId: "",
        lugarDestinoId: "",
        fechaMovimiento: new Date().toISOString().split('T')[0],
        motivo: "",
        responsable: "",
        observaciones: "",
      });
      
      // Recargar artículos
      cargarDatos();
    } catch (error: any) {
      console.error("Error al crear transferencia:", error);
      setError(error?.response?.data?.error || error?.message || "Error al crear la transferencia");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Transferencia de Activos"
        description="Transfiere un activo de un lugar a otro. El código cambiará según el nuevo lugar y el anterior quedará como 'Transferido'."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-8/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Transferir Activo
                </h2>

                <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>📝 Nota:</strong> Al transferir, el artículo original quedará marcado como &quot;Transferido&quot; 
                    y se creará uno nuevo con el código correspondiente al lugar destino.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-sm bg-red-100 dark:bg-red-900/30 px-4 py-3">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 rounded-sm bg-green-100 dark:bg-green-900/30 px-4 py-3">
                    <p className="text-sm text-green-800 dark:text-green-400">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Información del Artículo */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white border-b border-body-color pb-2">
                      Selecciona el Artículo
                    </h3>
                    
                    <div className="mb-6">
                      <label
                        htmlFor="articuloId"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Artículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="articuloId"
                        id="articuloId"
                        value={formData.articuloId}
                        onChange={handleChange}
                        required
                        className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >
                        <option value="">Seleccione un artículo</option>
                        {articulos.map((articulo) => (
                          <option key={articulo.id} value={articulo.id}>
                            {articulo.codigo} - {articulo.nombre} (Actual: {articulo.lugar_nombre || articulo.lugar})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Información del Movimiento */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white border-b border-body-color pb-2">
                      Detalles de la Transferencia
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Lugar Destino */}
                      <div className="md:col-span-2">
                        <label
                          htmlFor="lugarDestinoId"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Lugar Destino <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="lugarDestinoId"
                          id="lugarDestinoId"
                          value={formData.lugarDestinoId}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        >
                          <option value="">Seleccione lugar de destino</option>
                          {lugares.map((lugar) => (
                            <option key={lugar.id} value={lugar.id}>
                              {lugar.nombre} ({lugar.iniciales})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fecha de Movimiento */}
                      <div>
                        <label
                          htmlFor="fechaMovimiento"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Fecha de Movimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="fechaMovimiento"
                          id="fechaMovimiento"
                          value={formData.fechaMovimiento}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      {/* Responsable */}
                      <div>
                        <label
                          htmlFor="responsable"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Responsable <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="responsable"
                          id="responsable"
                          value={formData.responsable}
                          onChange={handleChange}
                          placeholder="Nombre del responsable"
                          required
                          className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>
                    </div>

                    {/* Motivo */}
                    <div className="mt-6">
                      <label
                        htmlFor="motivo"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Motivo del Movimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="motivo"
                        id="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        placeholder="Ej: Reasignación de equipo"
                        required
                        className="border-stroke dark:text-white dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    {/* Observaciones */}
                    <div className="mt-6">
                      <label
                        htmlFor="observaciones"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Observaciones
                      </label>
                      <textarea
                        name="observaciones"
                        id="observaciones"
                        rows={4}
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales sobre el movimiento..."
                        className="border-stroke dark:text-white dark:shadow-two w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-gray-600 dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Transferir Activo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Está seguro de cancelar? Se perderán los datos ingresados.")) {
                          window.location.href = "/admin/detalle/lista";
                        }
                      }}
                      className="rounded-sm bg-gray-300 px-9 py-4 text-base font-medium text-dark shadow-submit duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>

                <div className="mt-8 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    <strong>Nota:</strong> Los campos marcados con{" "}
                    <span className="text-red-500">*</span> son obligatorios.
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

export default RegistrarMovimientoPage;
