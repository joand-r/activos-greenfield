"use client";

import React from "react";
import { Linea, CelularLinea, Personal } from "@/services/linea.service";

interface ModalEdicionLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  celulares: CelularLinea[];
  personalList: Personal[];
  editData: { numero: string; activo_id: string; personal_id: string; observaciones: string };
  setEditData: React.Dispatch<
    React.SetStateAction<{ numero: string; activo_id: string; personal_id: string; observaciones: string }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalEdicionLinea: React.FC<ModalEdicionLineaProps> = ({
  isOpen,
  linea,
  celulares,
  personalList,
  editData,
  setEditData,
  onSubmit,
  onClose,
}) => {
  if (!isOpen || !linea) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-base font-bold text-black dark:text-white leading-tight">
              Editar Línea #{linea.numero}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
              Corrige número, colaborador responsable o equipo vinculado
            </p>
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
            {/* Número */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Número Telefónico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editData.numero}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, numero: e.target.value }))
                }
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary font-mono"
              />
            </div>

            {/* Colaborador / Personal Asignado */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Colaborador Asignado (Personal)
              </label>
              <select
                value={editData.personal_id}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, personal_id: e.target.value }))
                }
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Sin Asignar (Línea Disponible en Stock) --</option>
                {personalList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.cargo || "Sin Cargo"} {p.departamento ? `(${p.departamento})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-gray-400">
                Puedes corregir o desvincular al colaborador directamente si hubo una equivocación al registrar.
              </p>
            </div>

            {/* Equipo Celular */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Equipo Celular Vinculado
              </label>
              <select
                value={editData.activo_id}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, activo_id: e.target.value }))
                }
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Sin Celular (Solo Chip) --</option>
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
                Dispositivos con 1 IMEI admiten 1 línea; equipos Dual SIM admiten hasta 2 líneas simultáneas.
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Observaciones
              </label>
              <textarea
                value={editData.observaciones}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, observaciones: e.target.value }))
                }
                placeholder="Notas internas..."
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
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer shadow-primary/15"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
