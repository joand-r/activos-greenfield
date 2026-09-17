"use client";

import React from "react";
import { Linea, CelularLinea } from "@/services/linea.service";

interface ModalCambiarEquipoLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  celulares: CelularLinea[];
  cambiarEquipoData: {
    activo_nuevo_id: string;
    motivo: string;
  };
  setCambiarEquipoData: React.Dispatch<
    React.SetStateAction<{
      activo_nuevo_id: string;
      motivo: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  onCrearCelularClick?: () => void;
}

export const ModalCambiarEquipoLinea: React.FC<ModalCambiarEquipoLineaProps> = ({
  isOpen,
  linea,
  celulares,
  cambiarEquipoData,
  setCambiarEquipoData,
  onSubmit,
  onClose,
  onCrearCelularClick,
}) => {
  if (!isOpen || !linea) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Cambiar Equipo Celular #{linea.numero}
              </h3>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Reemplaza o desvincula el teléfono asociado a esta línea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
            {/* Equipo Actual Asignado */}
            <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Equipo Celular Actual
              </p>
              {linea.celular_codigo ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-black dark:text-white">
                      [{linea.celular_codigo}] {linea.celular_nombre || linea.celular_modelo}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      {linea.celular_marca ? `${linea.celular_marca} · ` : ""}
                      IMEI: {linea.celular_imei_1 || "S/I"}
                      {linea.celular_imei_2 ? ` · IMEI 2: ${linea.celular_imei_2}` : ""}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    En Uso
                  </span>
                </div>
              ) : (
                <p className="font-semibold text-amber-600 dark:text-amber-400 italic">
                  Esta línea actualmente funciona como Solo Chip (Sin equipo celular vinculado).
                </p>
              )}
            </div>

            {/* Selector de Nuevo Equipo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-black dark:text-white">
                  Seleccionar Nuevo Equipo Celular <span className="text-red-500">*</span>
                </label>
                {onCrearCelularClick && (
                  <button
                    type="button"
                    onClick={onCrearCelularClick}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Celular
                  </button>
                )}
              </div>

              <select
                value={cambiarEquipoData.activo_nuevo_id}
                onChange={(e) =>
                  setCambiarEquipoData((prev) => ({
                    ...prev,
                    activo_nuevo_id: e.target.value,
                  }))
                }
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Sin Celular (Solo Chip / Desvincular) --</option>
                {celulares.map((cel) => {
                  const isAsignadoAEstaLinea = String(linea.activo_id) === String(cel.id);
                  const isBaja = cel.estado_operativo === "BAJA" || cel.estado_operativo === "DESHABILITADO";
                  const isOcupado = !cel.disponible_para_linea && !isAsignadoAEstaLinea && !isBaja;
                  const lineasTexto =
                    cel.lineas_asignadas && cel.lineas_asignadas.length > 0
                      ? `(Líneas: ${cel.lineas_asignadas.map((l) => `#${l.numero}`).join(", ")})`
                      : "";

                  if (isBaja && !isAsignadoAEstaLinea) {
                    return (
                      <option key={cel.id} value={cel.id} disabled className="text-gray-400">
                        [{cel.codigo}] {cel.nombre} — {cel.modelo} [NO DISPONIBLE / {cel.estado_operativo}]
                      </option>
                    );
                  }

                  if (isOcupado) {
                    return (
                      <option key={cel.id} value={cel.id} disabled className="text-gray-400">
                        [{cel.codigo}] {cel.nombre} — {cel.modelo} (IMEI 1: {cel.imei_1 || "N/A"}) — [OCUPADO ${
                          cel.max_lineas === 2 ? "2/2 Dual SIM" : "1/1"
                        } ${lineasTexto}]
                      </option>
                    );
                  }

                  return (
                    <option key={cel.id} value={cel.id}>
                      {isAsignadoAEstaLinea ? "✓ " : ""}
                      [{cel.codigo}] {cel.nombre} — {cel.modelo} (IMEI 1: {cel.imei_1 || "S/I"}
                      {cel.imei_2 ? ` | IMEI 2: ${cel.imei_2}` : ""}){" "}
                      {cel.max_lineas === 2
                        ? `[Dual SIM: ${cel.total_lineas_asignadas || (isAsignadoAEstaLinea ? 1 : 0)}/2]`
                        : ""}
                      {isAsignadoAEstaLinea ? " (Actual)" : ""}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-[10px] text-gray-400">
                El equipo anterior quedará automáticamente liberado y en estado disponible en inventario.
              </p>
            </div>

            {/* Motivo del Cambio */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Motivo del Cambio de Equipo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cambiarEquipoData.motivo}
                onChange={(e) =>
                  setCambiarEquipoData((prev) => ({
                    ...prev,
                    motivo: e.target.value,
                  }))
                }
                required
                placeholder="Ej: Renovación de dispositivo corporativo, equipo anterior dañado en reparación, extravío, etc."
                rows={3}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 p-3 text-black dark:text-white outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer shadow-indigo-600/20"
            >
              Guardar Cambio de Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
