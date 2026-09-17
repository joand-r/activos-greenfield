import React from "react";
import { Linea } from "@/services/linea.service";

interface ModalDarBajaLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  bajaData: { fecha_baja: string; motivo_baja: string };
  setBajaData: React.Dispatch<React.SetStateAction<{ fecha_baja: string; motivo_baja: string }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalDarBajaLinea: React.FC<ModalDarBajaLineaProps> = ({
  isOpen,
  linea,
  bajaData,
  setBajaData,
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 leading-tight font-mono">
                Dar de Baja Línea #{linea.numero}
              </h3>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Deshabilitación y liberación de recursos
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
            <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-300">
              <p className="font-bold text-xs">Advertencia de Desactivación</p>
              <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                Esta acción marcará la línea como <strong>DE BAJA</strong>, liberará el equipo celular asociado para su reasignación y guardará el motivo en el histórico de auditoría.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Fecha de Baja <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={bajaData.fecha_baja}
                onChange={(e) =>
                  setBajaData((prev) => ({ ...prev, fecha_baja: e.target.value }))
                }
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Motivo de la Baja <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bajaData.motivo_baja}
                onChange={(e) =>
                  setBajaData((prev) => ({ ...prev, motivo_baja: e.target.value }))
                }
                required
                placeholder="Ej: Desvinculación de personal, cancelación de contrato con operadora, extravío..."
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
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer active:scale-95"
            >
              Confirmar Baja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
