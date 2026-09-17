import React from "react";
import { CelularLinea, getColorEstadoCelular, getNombreEstadoCelular } from "@/services/linea.service";

interface ModalDetalleCelularProps {
  isOpen: boolean;
  celular: CelularLinea | null;
  onClose: () => void;
}

export const ModalDetalleCelular: React.FC<ModalDetalleCelularProps> = ({
  isOpen,
  celular,
  onClose,
}) => {
  if (!isOpen || !celular) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header Fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Ficha Técnica del Celular
              </h3>
              <p className="text-xs text-gray-500">
                {celular.codigo} • {celular.nombre}
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

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-black dark:text-white custom-scrollbar">
          {/* Cabecera del Equipo */}
          <div className="flex items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 p-4 border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm text-black dark:text-white">
                  {celular.codigo} - {celular.nombre}
                </h4>
                <p className="text-xs text-primary font-semibold">
                  {celular.marca_nombre} {celular.modelo}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getColorEstadoCelular(
                celular.estado_operativo
              )}`}
            >
              {getNombreEstadoCelular(celular.estado_operativo)}
            </span>
          </div>

          {/* Hardware & IMEIs */}
          <div>
            <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
              Especificaciones de Hardware
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Número de Serie</span>
                <span className="font-bold">{celular.serie || "No especificado"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Memoria RAM</span>
                <span className="font-bold">{celular.memoria || "No especificada"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Almacenamiento</span>
                <span className="font-bold">{celular.capacidad_disco || "No especificado"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Procesador</span>
                <span className="font-bold">{celular.procesador || "No especificado"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">IMEI 1</span>
                <span className="font-mono font-bold">{celular.imei_1 || "No registrado"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">IMEI 2</span>
                <span className="font-mono font-bold">{celular.imei_2 || "No registrado"}</span>
              </div>
            </div>
          </div>

          {/* Accesorios */}
          {celular.accesorios && (
            <div>
              <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
                Accesorios Incluidos
              </h5>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <p className="text-xs">{celular.accesorios}</p>
              </div>
            </div>
          )}

          {/* Asignación Actual */}
          <div>
            <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
              Línea(s) y Custodia
            </h5>
            {celular.lineas_asignadas && celular.lineas_asignadas.length > 0 ? (
              <div className="space-y-3">
                {celular.lineas_asignadas.map((lin, idx) => (
                  <div
                    key={lin.id || idx}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20"
                  >
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">
                        Línea Telefónica{" "}
                        {celular.lineas_asignadas && celular.lineas_asignadas.length > 1
                          ? `(SIM ${idx + 1})`
                          : ""}
                      </span>
                      <p className="font-bold text-sm text-primary font-mono">{lin.numero}</p>
                      <p className="text-[11px] text-gray-500">
                        {lin.telefonia_nombre} {lin.plan_nombre ? `• ${lin.plan_nombre}` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">
                        Colaborador Asignado
                      </span>
                      {lin.personal_nombre ? (
                        <div>
                          <p className="font-bold text-sm">{lin.personal_nombre}</p>
                          <p className="text-[11px] text-gray-500">
                            {lin.personal_cargo}{" "}
                            {lin.personal_departamento ? `(${lin.personal_departamento})` : ""}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sin custodio específico</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                  <span className="text-[10px] text-gray-400 block">Línea Telefónica Enlazada</span>
                  {celular.linea_numero ? (
                    <div>
                      <p className="font-bold text-sm text-primary font-mono">{celular.linea_numero}</p>
                      <p className="text-[11px] text-gray-500">
                        {celular.telefonia_nombre} • {celular.plan_nombre}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin línea telefónica asociada</span>
                  )}
                </div>

                <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                  <span className="text-[10px] text-gray-400 block">Colaborador Asignado</span>
                  {celular.personal_nombre ? (
                    <div>
                      <p className="font-bold text-sm">{celular.personal_nombre}</p>
                      <p className="text-[11px] text-gray-500">
                        {celular.personal_cargo} ({celular.personal_departamento})
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin custodio asignado</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Adquisición y Ubicación */}
          <div>
            <h5 className="font-bold text-black dark:text-white mb-2 uppercase tracking-wider text-[10px] text-gray-500">
              Adquisición y Ubicación
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Ubicación / Lugar</span>
                <span className="font-bold">{celular.lugar_nombre || "No especificado"}</span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Fecha Adquisición</span>
                <span className="font-bold">
                  {celular.fecha_adquision
                    ? new Date(celular.fecha_adquision).toLocaleDateString("es-BO")
                    : "No registrada"}
                </span>
              </div>
              <div className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-white/40 dark:bg-black/20">
                <span className="text-[10px] text-gray-400 block">Costo Adquisición</span>
                <span className="font-bold">
                  {celular.costo_adquision !== undefined
                    ? `Bs. ${parseFloat(String(celular.costo_adquision)).toFixed(2)}`
                    : "No registrado"}
                </span>
              </div>
            </div>
          </div>

          {/* Información de Baja (si aplica) */}
          {celular.estado_operativo === "BAJA" && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-4">
              <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-1 uppercase tracking-wider text-[10px]">
                Información de Baja
              </h5>
              <p className="text-xs text-rose-700 dark:text-rose-400 mb-1">
                <strong>Fecha de Baja:</strong>{" "}
                {celular.fecha_baja
                  ? new Date(celular.fecha_baja).toLocaleDateString("es-BO")
                  : "No especificada"}
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                <strong>Motivo:</strong> {celular.motivo_baja || "No especificado"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Fijo */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:bg-primary/90"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
