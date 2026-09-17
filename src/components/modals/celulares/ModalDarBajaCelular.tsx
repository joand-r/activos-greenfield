"use client";

import React from "react";
import { CelularLinea } from "@/services/linea.service";

interface ModalDarBajaCelularProps {
  isOpen: boolean;
  onClose: () => void;
  celular: CelularLinea | null;
  bajaData: {
    fecha_baja: string;
    motivo_baja: string;
  };
  setBajaData: React.Dispatch<
    React.SetStateAction<{
      fecha_baja: string;
      motivo_baja: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  guardando: boolean;
}

export const ModalDarBajaCelular: React.FC<ModalDarBajaCelularProps> = ({
  isOpen,
  onClose,
  celular,
  bajaData,
  setBajaData,
  onSubmit,
  guardando,
}) => {
  if (!isOpen || !celular) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Dar de Baja Celular
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Desincorporación técnica y retiro del inventario
              </p>
            </div>
          </div>
          <button
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
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4">
              <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                ¿Estás seguro de dar de baja este equipo celular?
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Esta acción marcará el celular como dado de baja en el inventario. El equipo pasará a estado inactivo.
              </p>
              {celular.linea_numero && (
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-2">
                  ⚠️ Atención: Este celular está actualmente asociado a la línea telefónica {celular.linea_numero}.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3.5 border border-black/5 dark:border-white/10">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Detalle del Equipo</p>
              <p className="font-bold text-sm text-black dark:text-white">
                {celular.codigo} - {celular.marca_nombre} {celular.modelo}
              </p>
              {celular.serie && (
                <p className="text-[11px] text-gray-500">Serie: {celular.serie}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-black dark:text-white mb-2">
                Fecha de Baja <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={bajaData.fecha_baja}
                onChange={(e) => setBajaData({ ...bajaData, fecha_baja: e.target.value })}
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-black dark:text-white mb-2">
                Motivo de la Baja <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={bajaData.motivo_baja}
                onChange={(e) => setBajaData({ ...bajaData, motivo_baja: e.target.value })}
                placeholder="Detalla el motivo de la baja (ej. daño irreparable, extravío, obsolescencia técnica)..."
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary"
                required
              />
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
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {guardando ? "Procesando..." : "Confirmar Baja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
