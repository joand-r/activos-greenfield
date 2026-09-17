import React from "react";
import { Telefonia, PlanTelefonia } from "@/services/linea.service";

interface ModalCrearEditarPlanProps {
  isOpen: boolean;
  modoEdicion?: boolean;
  planSeleccionado?: PlanTelefonia | null;
  telefonias: Telefonia[];
  formData: {
    telefonia_id: string;
    nombre: string;
    costo: string;
    estado?: "DISPONIBLE" | "NO_DISPONIBLE";
    descripcion?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  guardando?: boolean;
}

export const ModalCrearEditarPlan: React.FC<ModalCrearEditarPlanProps> = ({
  isOpen,
  modoEdicion = false,
  planSeleccionado,
  telefonias,
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-base font-bold text-black dark:text-white leading-tight">
              {modoEdicion ? `Editar Plan - ${planSeleccionado?.nombre || ""}` : "Crear Nuevo Plan Tarifario"}
            </h3>
            <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
              {modoEdicion
                ? "Actualiza las condiciones tarifarias y operativas del plan."
                : "Registra un nuevo plan telefónico corporativo."}
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
                Telefonía / Operadora <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.telefonia_id}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, telefonia_id: e.target.value }))
                }
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              >
                <option value="">-- Seleccionar Operadora --</option>
                {telefonias.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Nombre del Plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Plan Corporativo 25GB"
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Costo Mensual (Bs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costo}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, costo: e.target.value }))
                }
                placeholder="Ej: 180.00"
                required
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary font-mono"
              />
            </div>

            {modoEdicion && (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Estado del Plan
                </label>
                <select
                  value={formData.estado || "DISPONIBLE"}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, estado: e.target.value }))
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="DISPONIBLE">Disponible (Para nuevas contrataciones)</option>
                  <option value="NO_DISPONIBLE">No Disponible (Descontinuado)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Descripción / Beneficios
              </label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, descripcion: e.target.value }))
                }
                placeholder="Ej: Incluye 25GB, llamadas ilimitadas y WhatsApp libre..."
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
              disabled={guardando}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {guardando ? "Guardando..." : modoEdicion ? "Guardar Cambios" : "Crear Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
