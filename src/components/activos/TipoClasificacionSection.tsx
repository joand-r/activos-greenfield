import React from "react";
import {
  TipoActivo,
  ClasificacionActivo,
  getNombreTipoActivo,
} from "@/services/activo.service";

interface TipoClasificacionSectionProps {
  tipoActivo: TipoActivo | "";
  onTipoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  clasificacion: ClasificacionActivo;
  onClasificacionChange: (clasificacion: ClasificacionActivo) => void;
}

export const TipoClasificacionSection: React.FC<TipoClasificacionSectionProps> = ({
  tipoActivo,
  onTipoChange,
  clasificacion,
  onClasificacionChange,
}) => {
  return (
    <div className="mb-8 p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2">
        1. Tipo y Clasificación del Activo
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Activo */}
        <div>
          <label
            htmlFor="tipo_activo"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Seleccione el Tipo de Activo <span className="text-red-500">*</span>
          </label>
          <select
            id="tipo_activo"
            value={tipoActivo}
            onChange={onTipoChange}
            required
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          >
            <option value="">-- Seleccione un tipo --</option>
            <option value="EDIFICACION">{getNombreTipoActivo("EDIFICACION")}</option>
            <option value="ELECTRODOMESTICO">{getNombreTipoActivo("ELECTRODOMESTICO")}</option>
            <option value="EQUIPO_CAMPO">{getNombreTipoActivo("EQUIPO_CAMPO")}</option>
            <option value="HERRAMIENTA">{getNombreTipoActivo("HERRAMIENTA")}</option>
            <option value="MUEBLES_OFICINA">{getNombreTipoActivo("MUEBLES_OFICINA")}</option>
            <option value="MUEBLES_HOGAR">{getNombreTipoActivo("MUEBLES_HOGAR")}</option>
            <option value="UTENSILIO_EQUIPAMIENTO">{getNombreTipoActivo("UTENSILIO_EQUIPAMIENTO")}</option>
            <option value="EQUIPO_TECNOLOGICO">{getNombreTipoActivo("EQUIPO_TECNOLOGICO")}</option>
            <option value="CELULAR">{getNombreTipoActivo("CELULAR")}</option>
            <option value="VEHICULO">{getNombreTipoActivo("VEHICULO")}</option>
            <option value="MAQUINARIA">{getNombreTipoActivo("MAQUINARIA")}</option>
            <option value="TERRENO">{getNombreTipoActivo("TERRENO")}</option>
          </select>
        </div>

        {/* Clasificación de Activo (Fijo vs Menor) */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
            Clasificación del Activo <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl border cursor-pointer transition-all ${
                clasificacion === "FIJO"
                  ? "border-primary bg-primary/10 text-primary shadow-sm font-bold"
                  : "border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 text-dark dark:text-white opacity-80 hover:opacity-100"
              }`}
            >
              <input
                type="radio"
                name="clasificacion"
                value="FIJO"
                checked={clasificacion === "FIJO"}
                onChange={() => onClasificacionChange("FIJO")}
                className="w-3.5 h-3.5 text-primary mr-2"
              />
              <span className="text-xs">Activo Fijo</span>
            </label>

            <label
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl border cursor-pointer transition-all ${
                clasificacion === "MENOR"
                  ? "border-primary bg-primary/10 text-primary shadow-sm font-bold"
                  : "border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 text-dark dark:text-white opacity-80 hover:opacity-100"
              }`}
            >
              <input
                type="radio"
                name="clasificacion"
                value="MENOR"
                checked={clasificacion === "MENOR"}
                onChange={() => onClasificacionChange("MENOR")}
                className="w-3.5 h-3.5 text-primary mr-2"
              />
              <span className="text-xs">Activo Menor</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
