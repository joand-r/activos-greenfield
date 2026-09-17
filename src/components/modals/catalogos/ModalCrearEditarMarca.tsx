"use client";

import React from "react";
import { Marca } from "@/services/marca.service";

interface ModalCrearEditarMarcaProps {
  isOpen: boolean;
  modoEdicion: boolean;
  marca?: Marca | null;
  formData: { nombre: string; descripcion: string };
  setFormData: React.Dispatch<React.SetStateAction<{ nombre: string; descripcion: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  guardando?: boolean;
}

export const ModalCrearEditarMarca: React.FC<ModalCrearEditarMarcaProps> = ({
  isOpen,
  modoEdicion,
  marca,
  formData,
  setFormData,
  onSubmit,
  onClose,
  guardando = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-dark shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                {modoEdicion ? `Editar Marca ${marca ? `[#${marca.id}]` : ""}` : "Registrar Nueva Marca"}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {modoEdicion ? "Modifica los datos de la marca" : "Ingresa los datos para registrar la marca"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Nombre de la Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Samsung, Dell, Apple"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Descripción (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe la marca o detalles adicionales..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 px-4 py-2.5 text-black dark:text-white focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4 text-xs bg-gray-50/50 dark:bg-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {guardando ? "Guardando..." : modoEdicion ? "Guardar Cambios" : "Registrar Marca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
