import React from "react";
import { TipoActivo, getNombreTipoActivo } from "@/services/activo.service";

interface CamposEspecificosSectionProps {
  tipoActivo: TipoActivo;
  camposEquipoTecnologico: {
    modelo: string;
    procesador: string;
    memoria: string;
    capacidad_disco: string;
  };
  setCamposEquipoTecnologico: React.Dispatch<
    React.SetStateAction<{
      modelo: string;
      procesador: string;
      memoria: string;
      capacidad_disco: string;
    }>
  >;
  camposCelular: {
    modelo: string;
    procesador: string;
    memoria: string;
    capacidad_disco: string;
    imei_1: string;
    imei_2: string;
  };
  setCamposCelular: React.Dispatch<
    React.SetStateAction<{
      modelo: string;
      procesador: string;
      memoria: string;
      capacidad_disco: string;
      imei_1: string;
      imei_2: string;
    }>
  >;
  camposMotorizado: {
    tipo_vehiculo: string;
    motor: string;
    chasis: string;
    color: string;
    anho_modelo: string;
    placa: string;
  };
  setCamposMotorizado: React.Dispatch<
    React.SetStateAction<{
      tipo_vehiculo: string;
      motor: string;
      chasis: string;
      color: string;
      anho_modelo: string;
      placa: string;
    }>
  >;
  camposTerreno: {
    folio: string;
    nro_registro: string;
    area: string;
    ubicacion: string;
  };
  setCamposTerreno: React.Dispatch<
    React.SetStateAction<{
      folio: string;
      nro_registro: string;
      area: string;
      ubicacion: string;
    }>
  >;
}

export const CamposEspecificosSection: React.FC<CamposEspecificosSectionProps> = ({
  tipoActivo,
  camposEquipoTecnologico,
  setCamposEquipoTecnologico,
  camposCelular,
  setCamposCelular,
  camposMotorizado,
  setCamposMotorizado,
  camposTerreno,
  setCamposTerreno,
}) => {
  return (
    <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-emerald-500/20 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2">
        3. Información Específica - {getNombreTipoActivo(tipoActivo)}
      </h3>

      {/* Campos para EQUIPO_TECNOLOGICO */}
      {tipoActivo === "EQUIPO_TECNOLOGICO" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Modelo
            </label>
            <input
              type="text"
              value={camposEquipoTecnologico.modelo}
              onChange={(e) =>
                setCamposEquipoTecnologico({
                  ...camposEquipoTecnologico,
                  modelo: e.target.value,
                })
              }
              placeholder="Ej: Inspiron 15"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Procesador
            </label>
            <input
              type="text"
              value={camposEquipoTecnologico.procesador}
              onChange={(e) =>
                setCamposEquipoTecnologico({
                  ...camposEquipoTecnologico,
                  procesador: e.target.value,
                })
              }
              placeholder="Ej: Intel Core i5"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Memoria (RAM)
            </label>
            <input
              type="text"
              value={camposEquipoTecnologico.memoria}
              onChange={(e) =>
                setCamposEquipoTecnologico({
                  ...camposEquipoTecnologico,
                  memoria: e.target.value,
                })
              }
              placeholder="Ej: 8GB DDR4"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Capacidad de Disco
            </label>
            <input
              type="text"
              value={camposEquipoTecnologico.capacidad_disco}
              onChange={(e) =>
                setCamposEquipoTecnologico({
                  ...camposEquipoTecnologico,
                  capacidad_disco: e.target.value,
                })
              }
              placeholder="Ej: 512GB SSD"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
        </div>
      )}

      {/* Campos para CELULAR */}
      {tipoActivo === "CELULAR" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Modelo
            </label>
            <input
              type="text"
              value={camposCelular.modelo}
              onChange={(e) =>
                setCamposCelular({ ...camposCelular, modelo: e.target.value })
              }
              placeholder="Ej: iPhone 13 Pro / Galaxy S23"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Procesador
            </label>
            <input
              type="text"
              value={camposCelular.procesador}
              onChange={(e) =>
                setCamposCelular({ ...camposCelular, procesador: e.target.value })
              }
              placeholder="Ej: Apple A15 Bionic / Snapdragon 8 Gen 2"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Memoria (RAM)
            </label>
            <input
              type="text"
              value={camposCelular.memoria}
              onChange={(e) =>
                setCamposCelular({ ...camposCelular, memoria: e.target.value })
              }
              placeholder="Ej: 6GB / 8GB"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Almacenamiento (Capacidad)
            </label>
            <input
              type="text"
              value={camposCelular.capacidad_disco}
              onChange={(e) =>
                setCamposCelular({
                  ...camposCelular,
                  capacidad_disco: e.target.value,
                })
              }
              placeholder="Ej: 128GB / 256GB"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              IMEI 1 <span className="text-[10px] font-normal text-gray-500">(Opcional)</span>
            </label>
            <input
              type="text"
              value={camposCelular.imei_1}
              onChange={(e) =>
                setCamposCelular({ ...camposCelular, imei_1: e.target.value })
              }
              placeholder="Ej: 356938035643809"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              IMEI 2 <span className="text-[10px] font-normal text-gray-500">(Opcional)</span>
            </label>
            <input
              type="text"
              value={camposCelular.imei_2}
              onChange={(e) =>
                setCamposCelular({ ...camposCelular, imei_2: e.target.value })
              }
              placeholder="Ej: 356938035643810"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all font-mono"
            />
          </div>
        </div>
      )}

      {/* Campos para VEHICULO y MAQUINARIA */}
      {(tipoActivo === "VEHICULO" || tipoActivo === "MAQUINARIA") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Tipo de Vehículo
            </label>
            <input
              type="text"
              value={camposMotorizado.tipo_vehiculo}
              onChange={(e) =>
                setCamposMotorizado({
                  ...camposMotorizado,
                  tipo_vehiculo: e.target.value,
                })
              }
              placeholder="Ej: Camioneta, Sedan"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Motor
            </label>
            <input
              type="text"
              value={camposMotorizado.motor}
              onChange={(e) =>
                setCamposMotorizado({ ...camposMotorizado, motor: e.target.value })
              }
              placeholder="Ej: XYZ123456"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Chasis
            </label>
            <input
              type="text"
              value={camposMotorizado.chasis}
              onChange={(e) =>
                setCamposMotorizado({ ...camposMotorizado, chasis: e.target.value })
              }
              placeholder="Ej: ABC789012"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Color
            </label>
            <input
              type="text"
              value={camposMotorizado.color}
              onChange={(e) =>
                setCamposMotorizado({ ...camposMotorizado, color: e.target.value })
              }
              placeholder="Ej: Rojo"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Año del Modelo
            </label>
            <input
              type="number"
              value={camposMotorizado.anho_modelo}
              onChange={(e) =>
                setCamposMotorizado({
                  ...camposMotorizado,
                  anho_modelo: e.target.value,
                })
              }
              placeholder="Ej: 2023"
              min="1900"
              max="2100"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Placa
            </label>
            <input
              type="text"
              value={camposMotorizado.placa}
              onChange={(e) =>
                setCamposMotorizado({ ...camposMotorizado, placa: e.target.value })
              }
              placeholder="Ej: ABC-1234"
              maxLength={10}
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
        </div>
      )}

      {/* Campos para TERRENO */}
      {tipoActivo === "TERRENO" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Folio
            </label>
            <input
              type="text"
              value={camposTerreno.folio}
              onChange={(e) =>
                setCamposTerreno({ ...camposTerreno, folio: e.target.value })
              }
              placeholder="Ej: F-001"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Número de Registro
            </label>
            <input
              type="text"
              value={camposTerreno.nro_registro}
              onChange={(e) =>
                setCamposTerreno({
                  ...camposTerreno,
                  nro_registro: e.target.value,
                })
              }
              placeholder="Ej: REG-123456"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Área (m²)
            </label>
            <input
              type="number"
              step="0.01"
              value={camposTerreno.area}
              onChange={(e) =>
                setCamposTerreno({ ...camposTerreno, area: e.target.value })
              }
              placeholder="Ej: 1000.50"
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
              Ubicación Detallada
            </label>
            <textarea
              rows={3}
              value={camposTerreno.ubicacion}
              onChange={(e) =>
                setCamposTerreno({ ...camposTerreno, ubicacion: e.target.value })
              }
              placeholder="Descripción detallada de la ubicación del terreno..."
              className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
