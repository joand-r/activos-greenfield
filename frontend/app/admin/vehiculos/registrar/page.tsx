"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { vehiculoService } from "@/services/vehiculo.service";
import { lugarService, Lugar } from "@/services/lugar.service";
import { marcaService, Marca } from "@/services/marca.service";
import { uploadService } from "@/services/upload.service";

const RegistrarVehiculoPage = () => {
  const { showLoading, hideLoading } = useLoading();

  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    chasis: "",
    color: "",
    descripcion: "",
    estado: "Nuevo",
    lugarId: "",
    marcaId: "",
    imagen: "",
  });

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nextCode, setNextCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imagenVehiculo, setImagenVehiculo] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const estados = ["Nuevo", "Medio Uso", "Fregado", "En Reparación", "Obsoleto"];

  const cargarDatos = async () => {
    try {
      const [lugaresData, marcasData] = await Promise.all([
        lugarService.getAll(),
        marcaService.getAll(),
      ]);
      
      setLugares(lugaresData);
      setMarcas(marcasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos necesarios");
    }
  };

  useEffect(() => {
    document.title = "Registro de Vehículo | Activos Greenfield";
    cargarDatos();
  }, []);

  const loadNextCode = async (lugarId: string) => {
    if (!lugarId) {
      setNextCode("");
      return;
    }
    
    setLoadingCode(true);
    try {
      const url = `http://localhost:3001/api/vehiculos/next-code/${lugarId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        setNextCode("");
        return;
      }
      
      const data = await response.json();
      setNextCode(data.codigo);
    } catch (error) {
      console.error("Error al obtener código:", error);
      setNextCode("");
    } finally {
      setLoadingCode(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "lugarId" && value) {
      loadNextCode(value);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Solo se permiten archivos de imagen");
        return;
      }

      setImagenVehiculo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result as string);
      };
      reader.readAsDataURL(file);

      setUploadingImage(true);
      try {
        const imageBase64 = await new Promise<string>((resolve) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve(fr.result as string);
          fr.readAsDataURL(file);
        });

        const result = await uploadService.uploadImage(imageBase64);
        setFormData(prev => ({ ...prev, imagen: result.url }));
        setError("");
      } catch (error) {
        console.error("Error al subir imagen:", error);
        setError("Error al subir la imagen a Cloudinary");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    showLoading();
    
    try {
      if (!formData.lugarId) {
        setError("Debe seleccionar un lugar primero");
        return;
      }

      const dataToSend = {
        ...formData,
        lugarId: parseInt(formData.lugarId),
        marcaId: parseInt(formData.marcaId),
      };

      const nuevoVehiculo = await vehiculoService.create(dataToSend);
      setSuccess(`Vehículo registrado exitosamente con código: ${nuevoVehiculo.codigo}`);
      
      setFormData({
        placa: "",
        modelo: "",
        chasis: "",
        color: "",
        descripcion: "",
        estado: "Nuevo",
        lugarId: "",
        marcaId: "",
        imagen: "",
      });
      setNextCode("");
      setImagenVehiculo(null);
      setPreviewImagen(null);
    } catch (error: any) {
      console.error("Error al registrar vehículo:", error);
      setError(error.message || "Error al registrar el vehículo");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Registro de Vehículo"
        description="Añade un nuevo vehículo al inventario"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-10/12 xl:w-8/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Registrar Nuevo Vehículo
                </h2>

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
                  <div className="mb-8">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white border-b border-body-color pb-2">
                      Información Básica
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="lugarId" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Lugar (Ubicación) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="lugarId"
                          id="lugarId"
                          value={formData.lugarId}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        >
                          <option value="">Seleccione un lugar</option>
                          {lugares.map((lugar) => (
                            <option key={lugar.id} value={lugar.id}>
                              {lugar.nombre} ({lugar.iniciales})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="codigo" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Código que se asignará
                        </label>
                        <input
                          type="text"
                          id="codigo"
                          value={loadingCode ? "Cargando..." : nextCode || "Seleccione un lugar"}
                          readOnly
                          disabled
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="placa" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Placa <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="placa"
                          id="placa"
                          value={formData.placa}
                          onChange={handleChange}
                          placeholder="Ej: 1234-ABC"
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="modelo" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Modelo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="modelo"
                          id="modelo"
                          value={formData.modelo}
                          onChange={handleChange}
                          placeholder="Ej: Corolla 2020"
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="chasis" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Chasis <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="chasis"
                          id="chasis"
                          value={formData.chasis}
                          onChange={handleChange}
                          placeholder="Ej: 1HGBH41JXMN109186"
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="color" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="color"
                          id="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="Ej: Blanco"
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="estado" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Estado <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="estado"
                          id="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        >
                          {estados.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="marcaId" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Marca <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="marcaId"
                          id="marcaId"
                          value={formData.marcaId}
                          onChange={handleChange}
                          required
                          className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        >
                          <option value="">Seleccione una marca</option>
                          {marcas.map((marca) => (
                            <option key={marca.id} value={marca.id}>
                              {marca.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label htmlFor="descripcion" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        id="descripcion"
                        rows={4}
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Describe las características del vehículo..."
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    <div className="mt-6">
                      <label htmlFor="imagen" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Imagen del Vehículo {uploadingImage && <span className="text-primary">(Subiendo...)</span>}
                      </label>
                      
                      {!previewImagen ? (
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="imagen"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click para subir</span> o arrastra y suelta
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              name="imagen"
                              id="imagen"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="relative w-full">
                          <div className="flex items-center justify-center w-full">
                            <img
                              src={previewImagen}
                              alt="Preview"
                              className="max-h-64 rounded-lg object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImagen(null);
                              setImagenVehiculo(null);
                              setFormData(prev => ({ ...prev, imagen: "" }));
                            }}
                            className="mt-2 w-full rounded-sm bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                          >
                            Eliminar imagen
                          </button>
                          <p className="mt-2 text-center text-sm text-green-600 dark:text-green-400">
                            ✓ Imagen subida a Cloudinary exitosamente
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Registrar Vehículo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Está seguro de cancelar? Se perderán los datos ingresados.")) {
                          window.location.href = "/";
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

export default RegistrarVehiculoPage;
