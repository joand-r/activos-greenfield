import React from "react";
import { Linea, getColorEstadoLinea, getNombreEstadoLinea } from "@/services/linea.service";

interface ModalDetalleLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  onClose: () => void;
}

export const ModalDetalleLinea: React.FC<ModalDetalleLineaProps> = ({
  isOpen,
  linea,
  onClose,
}) => {
  if (!isOpen || !linea) return null;

  const formatearFecha = (fechaStr?: string | null) => {
    if (!fechaStr) return "N/A";
    try {
      // Si ya viene como YYYY-MM-DD o ISO
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return fechaStr;
      return fecha.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return fechaStr;
    }
  };

  // Evitar duplicar nombre y modelo si son iguales
  const nombreEquipo = linea.celular_nombre || "";
  const modeloEquipo = linea.celular_modelo || "";
  const descripcionEquipo =
    nombreEquipo && modeloEquipo && nombreEquipo.toLowerCase() !== modeloEquipo.toLowerCase()
      ? `${nombreEquipo} — ${modeloEquipo}`
      : modeloEquipo || nombreEquipo || "Equipo Celular";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white font-mono">
                  #{linea.numero}
                </h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getColorEstadoLinea(
                    linea.estado
                  )}`}
                >
                  {getNombreEstadoLinea(linea.estado)}
                </span>
              </div>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Ficha informativa y detalle de la línea corporativa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            title="Cerrar modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido con Scroll Suave */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs">
          
          {/* Card: Colaborador Asignado */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Colaborador Asignado
              </h4>
            </div>

            {linea.personal_nombre ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Nombre Completo:</p>
                  <p className="font-bold text-black dark:text-white text-sm mt-0.5">
                    {linea.personal_nombre}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Cargo & Departamento:</p>
                  <p className="font-medium text-black dark:text-white mt-0.5">
                    {linea.personal_cargo || "Sin cargo"} • {linea.personal_departamento || "General"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 italic py-1">
                <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Actualmente disponible en stock (sin colaborador asignado).</span>
              </div>
            )}
          </div>

          {/* Card: Plan y Tarifa */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Plan y Operadora
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Operadora:</p>
                <p className="font-bold text-primary mt-0.5">
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {linea.telefonia_nombre || "N/A"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Plan Corporativo:</p>
                <p className="font-bold text-black dark:text-white mt-0.5">
                  {linea.plan_nombre || "Sin Plan"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Costo Mensual:</p>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                  Bs. {parseFloat(String(linea.plan_costo || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Equipo Celular y Asignación */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Equipo Celular Asociado
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Equipo Vinculado:</p>
                {linea.celular_codigo ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg shrink-0">
                      {linea.celular_codigo}
                    </span>
                    <span className="font-bold text-black dark:text-white text-xs">
                      {descripcionEquipo}
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 italic mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Solo Chip (Sin Equipo Asociado)
                  </span>
                )}
              </div>

              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Fecha de Asignación:</p>
                <p className="font-medium text-black dark:text-white mt-0.5">
                  {formatearFecha(linea.fecha_asignacion)}
                </p>
              </div>

              {linea.celular_imei_1 && (
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">IMEI 1:</p>
                  <p className="font-mono text-xs font-semibold text-black dark:text-white mt-0.5">
                    {linea.celular_imei_1}
                  </p>
                </div>
              )}

              {linea.celular_imei_2 && (
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">IMEI 2 (Dual SIM):</p>
                  <p className="font-mono text-xs font-semibold text-black dark:text-white mt-0.5">
                    {linea.celular_imei_2}
                  </p>
                </div>
              )}

              {linea.celular_memoria && (
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Memoria RAM:</p>
                  <p className="font-medium text-black dark:text-white mt-0.5">
                    {linea.celular_memoria}
                  </p>
                </div>
              )}

              {linea.celular_capacidad && (
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Almacenamiento:</p>
                  <p className="font-medium text-black dark:text-white mt-0.5">
                    {linea.celular_capacidad}
                  </p>
                </div>
              )}
            </div>

            {/* Datos de Baja si corresponde */}
            {linea.estado === "BAJA" && (
              <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl">
                <p className="text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                  Detalles de la Baja
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-black dark:text-white">Fecha:</strong> {formatearFecha(linea.fecha_baja)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-black dark:text-white">Motivo:</strong> {linea.motivo_baja || "No especificado"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {linea.observaciones && (
            <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Observaciones Adicionales:
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                {linea.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Footer Fijo */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
