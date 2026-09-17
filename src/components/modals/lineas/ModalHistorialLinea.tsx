"use client";

import React, { useState } from "react";
import {
  Linea,
  HistorialLinea,
  HistorialLineaResponse,
} from "@/services/linea.service";

interface ModalHistorialLineaProps {
  isOpen: boolean;
  linea: Linea | null;
  historialList: HistorialLinea[];
  historialDetalle?: HistorialLineaResponse | null;
  cargandoHistorial: boolean;
  tabHistorial?: "linea" | "celular";
  setTabHistorial?: (tab: "linea" | "celular") => void;
  onClose: () => void;
}

const getColorEventoHistorial = (evento: string) => {
  switch (evento) {
    case "ASIGNACION":
    case "ACTIVACION":
      return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800";
    case "TRANSFERENCIA":
    case "REASIGNACION":
      return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800";
    case "CAMBIO_PLAN":
      return "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800";
    case "CAMBIO_EQUIPO":
      return "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800";
    case "BAJA":
    case "DESHABILITACION":
      return "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
  }
};

export const ModalHistorialLinea: React.FC<ModalHistorialLineaProps> = ({
  isOpen,
  linea,
  historialList,
  cargandoHistorial,
  onClose,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  if (!isOpen || !linea) return null;

  const totalCambiosEquipo = historialList.filter(
    (h) =>
      h.tipo_evento === "CAMBIO_EQUIPO" ||
      (h.activo_nuevo_codigo &&
        h.activo_anterior_codigo &&
        h.activo_nuevo_codigo !== h.activo_anterior_codigo)
  ).length;

  const totalTransferencias = historialList.filter(
    (h) => h.tipo_evento === "TRANSFERENCIA" || h.tipo_evento === "ASIGNACION"
  ).length;

  const totalPlanes = historialList.filter(
    (h) => h.tipo_evento === "CAMBIO_PLAN"
  ).length;

  const eventosFiltrados = historialList.filter((item) => {
    if (filtroTipo === "TODOS") return true;
    if (filtroTipo === "CAMBIO_EQUIPO") {
      return (
        item.tipo_evento === "CAMBIO_EQUIPO" ||
        (item.activo_nuevo_codigo &&
          item.activo_anterior_codigo &&
          item.activo_nuevo_codigo !== item.activo_anterior_codigo)
      );
    }
    if (filtroTipo === "TRANSFERENCIA") {
      return item.tipo_evento === "TRANSFERENCIA" || item.tipo_evento === "ASIGNACION";
    }
    if (filtroTipo === "CAMBIO_PLAN") {
      return item.tipo_evento === "CAMBIO_PLAN";
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white font-mono">
                  Historial de Línea #{linea.numero}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {historialList.length} eventos
                </span>
              </div>
              <p className="text-xs text-body-color dark:text-gray-400 mt-0.5">
                Trazabilidad de cambios de equipos, personal y planes tarifarios
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

        {/* Content con Scroll Suave */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs custom-scrollbar">
          {cargandoHistorial ? (
            <div className="py-12 text-center text-primary font-bold">
              Cargando historial de la línea...
            </div>
          ) : (
            <>
              {/* Filtros de eventos */}
              {historialList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">
                    Filtrar:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("TODOS")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filtroTipo === "TODOS"
                        ? "bg-black/80 dark:bg-white/90 text-white dark:text-black shadow-sm"
                        : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/10"
                    }`}
                  >
                    Todos ({historialList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroTipo("CAMBIO_EQUIPO")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filtroTipo === "CAMBIO_EQUIPO"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100"
                    }`}
                  >
                    📱 Cambios de Equipo ({totalCambiosEquipo})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroTipo("TRANSFERENCIA")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filtroTipo === "TRANSFERENCIA"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100"
                    }`}
                  >
                    👤 Personal ({totalTransferencias})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroTipo("CAMBIO_PLAN")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filtroTipo === "CAMBIO_PLAN"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100"
                    }`}
                  >
                    📄 Planes ({totalPlanes})
                  </button>
                </div>
              )}

              {/* Timeline de Eventos */}
              {eventosFiltrados.length > 0 ? (
                <div className="relative border-l-2 border-primary/30 ml-3 space-y-4 my-2 pr-1">
                  {eventosFiltrados.map((item) => {
                    const isCambioEquipo =
                      item.tipo_evento === "CAMBIO_EQUIPO" ||
                      (item.activo_nuevo_codigo &&
                        item.activo_anterior_codigo &&
                        item.activo_anterior_codigo !== item.activo_nuevo_codigo);

                    return (
                      <div key={item.id} className="relative pl-6">
                        <div
                          className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-white dark:border-gray-dark shadow-sm ${
                            item.tipo_evento === "CAMBIO_EQUIPO"
                              ? "bg-indigo-600"
                              : item.tipo_evento === "TRANSFERENCIA"
                              ? "bg-blue-600"
                              : item.tipo_evento === "CAMBIO_PLAN"
                              ? "bg-purple-600"
                              : "bg-primary"
                          }`}
                        />

                        <div
                          className={`rounded-2xl border p-4 shadow-sm transition-all ${
                            item.tipo_evento === "CAMBIO_EQUIPO"
                              ? "border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20"
                              : "border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold ${getColorEventoHistorial(
                                  item.tipo_evento
                                )}`}
                              >
                                {item.tipo_evento}
                              </span>
                              <span className="text-[11px] font-semibold text-black dark:text-white">
                                {new Date(item.fecha).toLocaleString("es-BO", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            {item.usuario_nombre && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                Auditor: <strong>{item.usuario_nombre}</strong>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Personal / Colaborador */}
                            {(item.personal_nuevo_nombre || item.personal_anterior_nombre) && (
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Colaborador
                                </p>
                                {item.tipo_evento === "TRANSFERENCIA" ? (
                                  <p className="font-semibold text-black dark:text-white mt-0.5">
                                    <span className="text-red-500 line-through mr-1">
                                      {item.personal_anterior_nombre || "Sin Asignar"}
                                    </span>
                                    ➜{" "}
                                    <span className="text-emerald-600 font-bold">
                                      {item.personal_nuevo_nombre}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="font-bold text-black dark:text-white mt-0.5">
                                    {item.personal_nuevo_nombre || item.personal_anterior_nombre}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Plan Tarifario */}
                            {(item.plan_nuevo_nombre || item.plan_anterior_nombre) && (
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Plan Tarifario
                                </p>
                                {item.tipo_evento === "CAMBIO_PLAN" ? (
                                  <p className="font-semibold text-black dark:text-white mt-0.5">
                                    <span className="text-red-500 line-through mr-1">
                                      {item.plan_anterior_nombre}
                                    </span>
                                    ➜{" "}
                                    <span className="text-teal-600 font-bold">
                                      {item.plan_nuevo_nombre}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="font-bold text-black dark:text-white mt-0.5">
                                    {item.plan_nuevo_nombre || item.plan_anterior_nombre}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Equipo Celular */}
                            {(item.activo_nuevo_codigo ||
                              item.activo_anterior_codigo ||
                              isCambioEquipo) && (
                              <div className="sm:col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Equipo Celular
                                </p>
                                {item.activo_anterior_codigo &&
                                item.activo_nuevo_codigo &&
                                item.activo_anterior_codigo !== item.activo_nuevo_codigo ? (
                                  <p className="font-semibold text-black dark:text-white mt-0.5">
                                    <span className="text-red-500 line-through mr-1">
                                      [{item.activo_anterior_codigo}] {item.activo_anterior_modelo}
                                    </span>
                                    ➜{" "}
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                      [{item.activo_nuevo_codigo}] {item.activo_nuevo_modelo}
                                    </span>
                                  </p>
                                ) : item.activo_anterior_codigo && !item.activo_nuevo_codigo ? (
                                  <p className="font-semibold text-black dark:text-white mt-0.5">
                                    <span className="text-red-500 line-through mr-1">
                                      [{item.activo_anterior_codigo}] {item.activo_anterior_modelo}
                                    </span>
                                    ➜{" "}
                                    <span className="text-amber-600 italic font-bold">
                                      Sin Celular (Solo Chip)
                                    </span>
                                  </p>
                                ) : !item.activo_anterior_codigo && item.activo_nuevo_codigo ? (
                                  <p className="font-semibold text-black dark:text-white mt-0.5">
                                    <span className="text-gray-400 italic mr-1">Sin Celular</span>
                                    ➜{" "}
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                      [{item.activo_nuevo_codigo}] {item.activo_nuevo_modelo}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="font-bold text-black dark:text-white mt-0.5">
                                    [{item.activo_nuevo_codigo || item.activo_anterior_codigo}]{" "}
                                    {item.activo_nuevo_modelo || item.activo_anterior_modelo}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Motivo */}
                            {item.motivo && (
                              <div className="sm:col-span-2 bg-white/60 dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Motivo / Observación
                                </p>
                                <p className="text-black dark:text-white mt-0.5 leading-relaxed">
                                  {item.motivo}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  No se encontraron eventos para el filtro seleccionado.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Fijo */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer shadow-md active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
