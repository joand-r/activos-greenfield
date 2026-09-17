import React from "react";
import { Linea, PlanTelefonia } from "@/services/linea.service";

interface ModalCambiarPlanLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  planes: PlanTelefonia[];
  cambiarPlanData: { plan_nuevo_id: string; motivo: string };
  setCambiarPlanData: React.Dispatch<React.SetStateAction<{ plan_nuevo_id: string; motivo: string }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalCambiarPlanLinea: React.FC<ModalCambiarPlanLineaProps> = ({
  isOpen,
  linea,
  planes,
  cambiarPlanData,
  setCambiarPlanData,
  onSubmit,
  onClose,
}) => {
  if (!isOpen || !linea) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight font-mono">
                Cambiar Plan #{linea.numero}
              </h3>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Actualiza el plan tarifario corporativo
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

        {/* Form Body con Scroll Suave */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs">
            <div className="p-3.5 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan Actual</p>
              <p className="text-sm font-bold text-black dark:text-white mt-0.5">{linea.plan_nombre || "Sin Plan"}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Bs. {parseFloat(String(linea.plan_costo || 0)).toFixed(2)} / mes
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Nuevo Plan Corporativo <span className="text-red-500">*</span>
              </label>
              <select
                value={cambiarPlanData.plan_nuevo_id}
                onChange={(e) =>
                  setCambiarPlanData((prev) => ({ ...prev, plan_nuevo_id: e.target.value }))
                }
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Seleccionar Plan --</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.telefonia_nombre} - {p.nombre} (Bs. {parseFloat(String(p.costo)).toFixed(2)}/mes)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Motivo del Cambio
              </label>
              <textarea
                value={cambiarPlanData.motivo}
                onChange={(e) =>
                  setCambiarPlanData((prev) => ({ ...prev, motivo: e.target.value }))
                }
                placeholder="Ej: Aumento de cupo de datos, cambio de tarifa corporativa..."
                rows={3}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 p-3 text-black dark:text-white outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          {/* Footer Fijo */}
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
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all cursor-pointer active:scale-95"
            >
              Actualizar Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
