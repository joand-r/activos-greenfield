"use client";

import React from "react";
import {
  Activo,
  getNombreTipoActivo,
  getNombreEstadoActivo,
  getNombreTipoConstancia,
  getNombreClasificacion,
  getColorClasificacion,
} from "@/services/activo.service";

interface ModalDetalleActivoProps {
  isOpen: boolean;
  onClose: () => void;
  activo: Activo | null;
  onEditar?: () => void;
  onVerImagenFullscreen?: () => void;
}

const etiquetasDatosEspecificos: Record<string, string> = {
  modelo: "Modelo",
  procesador: "Procesador",
  memoria: "Memoria RAM",
  capacidad_disco: "Almacenamiento",
  imei_1: "IMEI 1",
  imei_2: "IMEI 2",
  tipo_vehiculo: "Tipo de Vehículo",
  motor: "Nro. Motor",
  chasis: "Nro. Chasis",
  color: "Color",
  anho_modelo: "Año / Modelo",
  placa: "Placa",
  folio: "Folio Real",
  nro_registro: "Nro. Registro",
  area: "Área (m²)",
  ubicacion: "Ubicación Geográfica",
};

const getColorEstado = (estado: string) => {
  switch (estado) {
    case "NUEVO":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "USADO":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case "DISPONIBLE":
      return "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300";
    case "DANADO":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "DONADO":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "VENDIDO":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "TRANSFERIR":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const ModalDetalleActivo: React.FC<ModalDetalleActivoProps> = ({
  isOpen,
  onClose,
  activo,
  onEditar,
  onVerImagenFullscreen,
}) => {
  if (!isOpen || !activo) return null;

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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Detalle del Activo
              </h3>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                Código: {activo.codigo}
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {/* Imagen */}
          {activo.imagen && (
            <div className="flex justify-center">
              <div
                className="relative group cursor-zoom-in w-full max-h-64 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5"
                onClick={onVerImagenFullscreen}
                title="Clic para ver en pantalla completa"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activo.imagen}
                  alt={activo.nombre}
                  className="w-full max-h-64 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Ver pantalla completa
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN DESTACADA: Lugar y Estado */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3">Ubicación y Estado</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Lugar</p>
                <p className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {activo.lugar_nombre || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                {activo.estado ? (
                  <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ${getColorEstado(activo.estado)}`}>
                    {getNombreEstadoActivo(activo.estado)}
                  </span>
                ) : (
                  <p className="text-sm font-bold text-gray-500">N/A</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN: Identificación */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Identificación</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Código</p>
                <p className="text-xs font-mono font-bold text-black dark:text-white mt-0.5">{activo.codigo}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="text-xs font-semibold text-black dark:text-white mt-0.5">{activo.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipo de Activo</p>
                <span className="mt-0.5 inline-flex items-center rounded-xl bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {getNombreTipoActivo(activo.tipo_activo)}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Clasificación</p>
                <span className={`mt-0.5 inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-bold border ${getColorClasificacion(activo.clasificacion)}`}>
                  {getNombreClasificacion(activo.clasificacion)}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN: Adquisición */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Adquisición</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Fecha de Adquisición</p>
                <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                  {activo.fecha_adquision
                    ? new Date(activo.fecha_adquision).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Costo</p>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                  {activo.costo_adquision ? `Bs. ${parseFloat(String(activo.costo_adquision)).toFixed(2)}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipo de Constancia</p>
                <p className="text-xs font-medium text-black dark:text-white mt-0.5">
                  {activo.tipo_constancia ? getNombreTipoConstancia(activo.tipo_constancia) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nro. Constancia</p>
                <p className="text-xs font-medium text-black dark:text-white mt-0.5">{activo.nro_constancia || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Marca</p>
                <p className="text-xs font-medium text-black dark:text-white mt-0.5">{activo.marca_nombre || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Proveedor</p>
                <p className="text-xs font-medium text-black dark:text-white mt-0.5">{activo.proveedor_nombre || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: Descripción */}
          {activo.descripcion && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Descripción</h4>
              <p className="text-xs text-black dark:text-white leading-relaxed">{activo.descripcion}</p>
            </div>
          )}

          {/* SECCIÓN: Datos Específicos */}
          {activo.datos_especificos && (
            (() => {
              const entradas = Object.entries(activo.datos_especificos).filter(
                ([key, value]) => key !== "activo_id" && value !== null && value !== undefined && value !== ""
              );
              if (entradas.length === 0) return null;
              return (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">Datos Técnicos</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {entradas.map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {etiquetasDatosEspecificos[key] || key.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs font-medium text-black dark:text-white mt-0.5">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">ID: #{activo.id}</p>
          <div className="flex gap-2.5">
            {onEditar && !["TRANSFERIR", "VENDIDO", "DONADO", "DANADO"].includes(activo.estado || "") && (
              <button
                type="button"
                onClick={onEditar}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Editar Activo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
