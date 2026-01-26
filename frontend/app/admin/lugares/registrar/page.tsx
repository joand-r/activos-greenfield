"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { lugarService } from "@/services/lugar.service";

const RegistrarLugarPage = () => {
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    document.title = "Registro de Lugar | Activos Greenfield";
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    iniciales: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tiposLugar = [
    { id: "vivienda", nombre: "Vivienda" },
    { id: "oficina", nombre: "Oficina" },
    { id: "almacen", nombre: "Almacén" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Convertir iniciales a mayúsculas y limitar a 3 caracteres
    if (name === "iniciales") {
      const upper = value.toUpperCase().slice(0, 3);
      setFormData((prev) => ({
        ...prev,
        [name]: upper,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    showLoading();
    
    try {
      if (formData.iniciales.length !== 3) {
        setError("Las iniciales deben tener exactamente 3 caracteres");
        return;
      }

      const nuevoLugar = await lugarService.create(formData);
      setSuccess(`Lugar registrado exitosamente: ${nuevoLugar.nombre} (${nuevoLugar.iniciales})`);
      
      setFormData({
        nombre: "",
        tipo: "",
        iniciales: "",
      });
    } catch (error: any) {
      console.error("Error al registrar lugar:", error);
      setError(error.message || "Error al registrar el lugar");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Registro de Lugar"
        description="Añade un nuevo lugar al sistema"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12 xl:w-6/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Registrar Nuevo Lugar
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
                  <div className="mb-6">
                    <label
                      htmlFor="nombre"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Nombre del Lugar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Vivienda Santa Cruz Palmasola"
                      required
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="iniciales"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Iniciales (3 caracteres) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="iniciales"
                      id="iniciales"
                      value={formData.iniciales}
                      onChange={handleChange}
                      placeholder="VSP"
                      required
                      maxLength={3}
                      pattern="[A-Z]{3}"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                    <p className="mt-2 text-xs text-body-color dark:text-body-color-dark">
                      Las iniciales se usarán para generar códigos de artículos (Ej: VSP-001, VSP-002)
                    </p>
                  </div>

                  <div className="mb-8">
                    <label
                      htmlFor="tipo"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Tipo de Lugar <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tipo"
                      id="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    >
                      <option value="">Seleccione un tipo</option>
                      {tiposLugar.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Registrar Lugar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Está seguro de cancelar? Se perderán los datos ingresados.")) {
                          window.location.href = "/admin/lugares/lista";
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

export default RegistrarLugarPage;
