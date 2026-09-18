import React from "react";
import Link from "next/link";
import { Telefonia } from "@/services/linea.service";

interface LineasFilterBarProps {
  vistaTab: "todas" | "activas" | "disponibles" | "bajas";
  onTabChange: (tab: "todas" | "activas" | "disponibles" | "bajas") => void;
  counts: {
    total: number;
    activas: number;
    disponibles: number;
    bajas: number;
  };
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroTelefonia: number | "";
  onTelefoniaChange: (val: number | "") => void;
  telefonias: Telefonia[];
  filtroEstado: string;
  onEstadoChange: (val: string) => void;
  onPrint: () => void;
}

export const LineasFilterBar: React.FC<LineasFilterBarProps> = ({
  vistaTab,
  onTabChange,
  counts,
  busqueda,
  onBusquedaChange,
  filtroTelefonia,
  onTelefoniaChange,
  telefonias,
  filtroEstado,
  onEstadoChange,
  onPrint,
}) => {
  return (
    <>
      {/* Pestañas de Vista y Botones de Acción */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTabChange("todas")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              vistaTab === "todas"
                ? "bg-primary text-white shadow-md"
                : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
            }`}
          >
            Todas ({counts.total})
          </button>
          <button
            onClick={() => onTabChange("activas")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              vistaTab === "activas"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
            }`}
          >
            Activas ({counts.activas})
          </button>
          <button
            onClick={() => onTabChange("disponibles")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              vistaTab === "disponibles"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
            }`}
          >
            Disponibles / Stock ({counts.disponibles})
          </button>
          <button
            onClick={() => onTabChange("bajas")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              vistaTab === "bajas"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-white/60 dark:bg-black/40 text-black dark:text-white hover:bg-black/5"
            }`}
          >
            De Baja ({counts.bajas})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Reporte
          </button>
          <Link
            href="/admin/lineas/registrar"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar Línea
          </Link>
        </div>
      </div>

      {/* Inputs y Selects de Filtrado */}
      <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-black dark:text-white">
              Buscar por número, persona o equipo
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Ej: 70123456, Daniela, iPhone..."
              className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black dark:text-white">
              Filtrar por Telefonía
            </label>
            <select
              value={filtroTelefonia}
              onChange={(e) => onTelefoniaChange(e.target.value ? Number(e.target.value) : "")}
              className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
            >
              <option value="">Todas las telefonías</option>
              {telefonias.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-black dark:text-white">
              Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVA">Activa</option>
              <option value="DISPONIBLE">Disponible (Stock)</option>
              <option value="SUSPENDIDA">Suspendida</option>
              <option value="BAJA">De Baja</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
