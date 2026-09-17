import React from "react";
import { CelularLinea, EstadoOperativoCelular } from "@/services/linea.service";

interface ModalCambiarEstadoCelularProps {
  isOpen: boolean;
  celular: CelularLinea | null;
  estadoData: {
    estado_operativo: EstadoOperativoCelular;
    accesorios: string;
    motivo: string;
  };
  setEstadoData: React.Dispatch<
    React.SetStateAction<{
      estado_operativo: EstadoOperativoCelular;
      accesorios: string;
      motivo: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  guardando?: boolean;
}

export const ModalCambiarEstadoCelular: React.FC<ModalCambiarEstadoCelularProps> = ({
  isOpen,
  celular,
  estadoData,
  setEstadoData,
  onSubmit,
  onClose,
  guardando = false,
}) => {
  if (!isOpen || !celular) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Cambiar Estado Operativo
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {celular.codigo} • {celular.nombre} ({celular.modelo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
            <div>
              <label className="block font-bold text-black dark:text-white mb-1.5">
                Nuevo Estado Operativo <span className="text-red-500">*</span>
              </label>
              <select
                value={estadoData.estado_operativo}
                onChange={(e) =>
                  setEstadoData((prev) => ({
                    ...prev,
                    estado_operativo: e.target.value as EstadoOperativoCelular,
                  }))
                }
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="DISPONIBLE">Disponible (En Stock para Asignar)</option>
                <option value="ACTIVO">En Servicio (Activo)</option>
                <option value="DESHABILITADO">Deshabilitado (Bloqueado temporalmente)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-black dark:text-white mb-1.5">
                Accesorios Incluidos
              </label>
              <textarea
                value={estadoData.accesorios}
                onChange={(e) =>
                  setEstadoData((prev) => ({ ...prev, accesorios: e.target.value }))
                }
                placeholder="Ej: Cargador original 20W, cable USB-C, funda de silicona..."
                rows={3}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 p-3 text-black dark:text-white outline-none focus:border-primary"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-black dark:text-white mb-1.5">
                Motivo / Observaciones del Cambio
              </label>
              <textarea
                value={estadoData.motivo}
                onChange={(e) =>
                  setEstadoData((prev) => ({ ...prev, motivo: e.target.value }))
                }
                placeholder="Ej: Entrega de accesorios nuevos, mantenimiento de software..."
                rows={2}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 p-3 text-black dark:text-white outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Actualizar Estado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
