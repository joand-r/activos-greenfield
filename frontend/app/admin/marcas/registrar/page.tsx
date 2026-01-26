"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { marcaService } from "@/services/marca.service";

const RegistrarMarcaPage = () => {
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    document.title = "Registro de Marca | Activos Greenfield";
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    showLoading();
    
    try {
      const nuevaMarca = await marcaService.create(formData);
      setSuccess(`Marca registrada exitosamente: ${nuevaMarca.nombre}`);
      
      setFormData({
        nombre: "",
        descripcion: "",
      });
    } catch (error: any) {
      console.error("Error al registrar marca:", error);
      setError(error.message || "Error al registrar la marca");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Registro de Marca"
        description="Añade una nueva marca al sistema"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12 xl:w-6/12">
              <div className="shadow-three dark:bg-gray-dark rounded-lg bg-white p-8 sm:p-12">
                <h2 className="mb-8 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Registrar Nueva Marca
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
                      Nombre de la Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Samsung"
                      required
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  <div className="mb-8">
                    <label
                      htmlFor="descripcion"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      Descripción (Opcional)
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      rows={4}
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describe la marca..."
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                    >
                      Registrar Marca
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Está seguro de cancelar? Se perderán los datos ingresados.")) {
                          window.location.href = "/admin/marcas/lista";
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

export default RegistrarMarcaPage;
