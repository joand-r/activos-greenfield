"use client";

import React from "react";
import { Movimiento } from "@/services/movimiento.service";

interface ModalDetalleMovimientoProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento: Movimiento | null;
}

const formatearFecha = (fecha: string) => {
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return fecha;
  }
};

const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case "NUEVO":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "USADO":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case "DISPONIBLE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "DANADO":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "DONADO":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "VENDIDO":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "TRANSFERIR":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const formatearEstado = (estado: string) => {
  const nombres: Record<string, string> = {
    NUEVO: "Nuevo",
    USADO: "Usado",
    DISPONIBLE: "Disponible",
    DANADO: "Dañado",
    DONADO: "Donado",
    VENDIDO: "Vendido",
    TRANSFERIR: "Por Transferir",
  };
  return nombres[estado] || estado;
};

const getLugarDestinoLabel = (mov: Movimiento) => {
  if (mov.lugar_destino_nombre) return mov.lugar_destino_nombre;
  switch (mov.estado) {
    case "DANADO":
      return "Fue Dañado";
    case "DONADO":
      return "Fue Donado";
    case "VENDIDO":
      return "Fue Vendido";
    default:
      return "N/A";
  }
};

export const ModalDetalleMovimiento: React.FC<ModalDetalleMovimientoProps> = ({
  isOpen,
  onClose,
  movimiento,
}) => {
  if (!isOpen || !movimiento) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
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
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Detalle del Movimiento
              </h3>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {movimiento.codigo_movimiento}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">ID del Registro</p>
              <p className="text-xs font-mono font-bold text-black dark:text-white">#{movimiento.id}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Código Movimiento</p>
              <p className="text-xs font-mono font-bold text-black dark:text-white">{movimiento.codigo_movimiento}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Activo Afectado</p>
            <p className="text-xs font-bold text-black dark:text-white">
              {movimiento.activo_nombre || movimiento.activo_codigo || `ID: ${movimiento.activo_id}`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Lugar Origen</p>
              <p className="text-xs font-medium text-black dark:text-white">
                {movimiento.lugar_origen_nombre || `ID: ${movimiento.lugar_origen_id}`}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Lugar Destino</p>
              <p className="text-xs font-medium text-black dark:text-white">
                {getLugarDestinoLabel(movimiento)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Fecha del Movimiento</p>
              <p className="text-xs font-medium text-black dark:text-white">
                {formatearFecha(movimiento.fecha_movimiento)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Responsable</p>
              <p className="text-xs font-medium text-black dark:text-white">{movimiento.responsable}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Estado Traslado / Operativo</p>
            <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[11px] font-bold ${obtenerColorEstado(movimiento.estado)}`}>
              {formatearEstado(movimiento.estado)}
            </span>
          </div>

          {movimiento.observaciones && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Observaciones</p>
              <p className="text-xs text-black dark:text-white leading-relaxed">{movimiento.observaciones}</p>
            </div>
          )}

          {/* Bloque especial para transferencias */}
          {movimiento.estado === "TRANSFERIR" && movimiento.nuevo_activo_id && (
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 mb-1">Transferencia Registrada</p>
              <p className="text-[11px] text-yellow-700 dark:text-yellow-500 leading-relaxed">
                Activo original marcado como <strong>TRANSFERIR</strong>. Se creó el nuevo activo{" "}
                <strong>{movimiento.nuevo_activo_codigo}</strong> ({movimiento.nuevo_activo_nombre}) en el lugar destino.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
