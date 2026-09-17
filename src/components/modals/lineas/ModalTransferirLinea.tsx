import React from "react";
import { Linea, Personal } from "@/services/linea.service";

interface ModalTransferirLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  personalList: Personal[];
  transferirData: { personal_nuevo_id: string; motivo: string };
  setTransferirData: React.Dispatch<React.SetStateAction<{ personal_nuevo_id: string; motivo: string }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalTransferirLinea: React.FC<ModalTransferirLineaProps> = ({
  isOpen,
  linea,
  personalList,
  transferirData,
  setTransferirData,
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight font-mono">
                Transferir Línea #{linea.numero}
              </h3>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Reasigna esta línea a otro colaborador
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Colaborador Actual
              </p>
              <p className="text-sm font-bold text-black dark:text-white mt-0.5">
                {linea.personal_nombre || "Sin Asignar (En Stock)"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Nuevo Colaborador Responsable <span className="text-red-500">*</span>
              </label>
              <select
                value={transferirData.personal_nuevo_id}
                onChange={(e) =>
                  setTransferirData((prev) => ({ ...prev, personal_nuevo_id: e.target.value }))
                }
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Seleccionar Colaborador --</option>
                {personalList
                  .filter((p) => p.id !== linea.personal_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.cargo} - {p.departamento})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Motivo de la Transferencia
              </label>
              <textarea
                value={transferirData.motivo}
                onChange={(e) =>
                  setTransferirData((prev) => ({ ...prev, motivo: e.target.value }))
                }
                placeholder="Ej: Reasignación de puesto, cambio de sucursal..."
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
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer active:scale-95"
            >
              Confirmar Transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
