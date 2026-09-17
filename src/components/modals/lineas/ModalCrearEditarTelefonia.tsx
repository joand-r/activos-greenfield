import React from "react";
import { Telefonia } from "@/services/linea.service";

interface ModalCrearEditarTelefoniaProps {
  isOpen: boolean;
  modoEdicion?: boolean;
  telefoniaSeleccionada?: Telefonia | null;
  nombre: string;
  setNombre: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  guardando?: boolean;
}

export const ModalCrearEditarTelefonia: React.FC<ModalCrearEditarTelefoniaProps> = ({
  isOpen,
  modoEdicion = false,
  telefoniaSeleccionada,
  nombre,
  setNombre,
  onSubmit,
  onClose,
  guardando = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-base font-bold text-black dark:text-white leading-tight">
              {modoEdicion ? `Editar Operadora - ${telefoniaSeleccionada?.nombre || ""}` : "Registrar Nueva Operadora"}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
              {modoEdicion
                ? "Modifica el nombre de la compañía de telecomunicaciones."
                : "Registra una empresa de telefonía (ej. Tigo, Entel, Viva)."}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Nombre de la Operadora <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Tigo, Entel, Viva"
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
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
              disabled={guardando}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {guardando ? "Guardando..." : modoEdicion ? "Guardar Cambios" : "Registrar Operadora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
