"use client";

import React from "react";
import { Linea, CelularLinea, Personal, PlanTelefonia } from "@/services/linea.service";

interface ModalEdicionLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  celulares: CelularLinea[];
  personalList: Personal[];
  planes?: PlanTelefonia[];
  editData: {
    numero: string;
    activo_id: string;
    personal_id: string;
    plan_id?: string;
    observaciones: string;
  };
  setEditData: React.Dispatch<
    React.SetStateAction<{
      numero: string;
      activo_id: string;
      personal_id: string;
      plan_id?: string;
      observaciones: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalEdicionLinea: React.FC<ModalEdicionLineaProps> = ({
  isOpen,
  linea,
  celulares,
  personalList,
  planes = [],
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
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Editar Línea #{linea.numero}
              </h3>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Corrige número, plan, colaborador responsable o equipo vinculado
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

            {/* Plan de Telefonía */}
            {planes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Plan de Telefonía
                </label>
                <select
                  value={editData.plan_id || String(linea.plan_id)}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, plan_id: e.target.value }))
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — Bs. {parseFloat(String(p.costo || 0)).toFixed(2)}/mes {p.telefonia_nombre ? `(${p.telefonia_nombre})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer shadow-amber-500/20"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
