import React from "react";
import { Personal } from "@/services/linea.service";

interface ModalCrearEditarPersonalProps {
  isOpen: boolean;
  modoEdicion?: boolean;
  personalSeleccionado?: Personal | null;
  formData: {
    nombre: string;
    departamento: string;
    cargo: string;
    estado?: "ACTIVO" | "INACTIVO";
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  guardando?: boolean;
}

export const ModalCrearEditarPersonal: React.FC<ModalCrearEditarPersonalProps> = ({
  isOpen,
  modoEdicion = false,
  personalSeleccionado,
  formData,
  setFormData,
  onSubmit,
  onClose,
  guardando = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-base font-bold text-black dark:text-white leading-tight">
              {modoEdicion ? `Editar Colaborador - ${personalSeleccionado?.nombre || ""}` : "Registrar Nuevo Colaborador"}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
              {modoEdicion
                ? "Actualiza la información laboral y estado del personal."
                : "Registra un colaborador para asignaciones."}
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
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Lic. Juan Pérez Morales"
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Departamento / Área <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.departamento}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, departamento: e.target.value }))
                }
                placeholder="Ej: Gerencia Comercial, Finanzas, Sistemas..."
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Cargo / Función <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, cargo: e.target.value }))
                }
                placeholder="Ej: Gerente Regional, Auditor, Asistente..."
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            {modoEdicion && (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Estado
                </label>
                <select
                  value={formData.estado || "ACTIVO"}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, estado: e.target.value }))
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="ACTIVO">Activo (Habilitado)</option>
                  <option value="INACTIVO">Inactivo (Desvinculado / No elegible)</option>
                </select>
              </div>
            )}
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
              {guardando ? "Guardando..." : modoEdicion ? "Guardar Cambios" : "Registrar Personal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
