"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { articuloService, Articulo } from "@/services/articulo.service";
import { lugarService, Lugar } from "@/services/lugar.service";

const ViviendaPage = () => {
  const { showLoading, hideLoading } = useLoading();
  const [activos, setActivos] = useState<Articulo[]>([]);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [error, setError] = useState<string>("");
  
  useEffect(() => {
    const cargarDatos = async () => {
      showLoading();
      try {
        // Obtener todos los lugares y filtrar por tipo Vivienda
        const lugares = await lugarService.getAll();
        const vivienda = lugares.find((l: Lugar) => l.tipo === 'Vivienda');
        
        if (vivienda) {
          setLugar(vivienda);
          // Cargar artículos del lugar
          const data = await articuloService.getByLugar(vivienda.id);
          setActivos(data);
        } else {
          setError('No se encontró el lugar de tipo Vivienda');
        }
      } catch (err: any) {
        console.error('Error al cargar datos de vivienda:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        hideLoading();
      }
    };
    
    cargarDatos();
  }, []);

  return (
    <>
      <Breadcrumb
        pageName={lugar ? `${lugar.nombre} (${lugar.iniciales})` : "Vivienda"}
        description="Activos disponibles para viviendas"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[510px] text-center">
                <h2 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
                  {lugar ? `${lugar.nombre} (${lugar.iniciales})` : "Lugar: Vivienda"}
                </h2>
                <p className="text-base !leading-relaxed text-body-color md:text-lg">
                  Activos y equipamiento para espacios residenciales
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {!error && activos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body-color dark:text-body-color-dark">No hay artículos en este lugar</p>
            </div>
          )}

          <div className="-mx-4 flex flex-wrap">
            {activos.map((item) => (
              <div key={item.id} className="w-full px-4 md:w-1/2 lg:w-1/3 mb-8">
                <div className="shadow-three hover:shadow-one dark:bg-gray-dark rounded-lg bg-white overflow-hidden transition-all dark:hover:shadow-gray-dark">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {item.imagen ? (
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-3 text-xl font-semibold text-black dark:text-white">
                      {item.nombre}
                    </h3>
                    <p className="mb-4 text-sm">
                      <strong>Estado:</strong>{" "}
                      <span className={item.estado === "Disponible" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                        {item.estado}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ViviendaPage;
