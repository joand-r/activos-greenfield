import React from "react";
import {
  Linea,
  getColorEstadoLinea,
  getNombreEstadoLinea,
} from "@/services/linea.service";

interface LineasTableProps {
  lineas: Linea[];
  onDetalle: (linea: Linea) => void;
  onTransferir: (linea: Linea) => void;
  onCambiarPlan: (linea: Linea) => void;
  onCambiarEquipo: (linea: Linea) => void;
  onHistorial: (linea: Linea) => void;
  onEdicion: (linea: Linea) => void;
  onBaja: (linea: Linea) => void;
}

export const LineasTable: React.FC<LineasTableProps> = ({
  lineas,
  onDetalle,
  onTransferir,
  onCambiarPlan,
  onCambiarEquipo,
  onHistorial,
  onEdicion,
  onBaja,
}) => {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
            <tr>
              <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Número
              </th>
              <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Personal Asignado
              </th>
              <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Telefonía
              </th>
              <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Plan (Tarifa Mensual)
              </th>
              <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Equipo Celular
              </th>
              <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Estado
              </th>
              <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {lineas.length > 0 ? (
              lineas.map((linea) => (
                <tr
                  key={linea.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Número */}
                  <td className="px-5 py-4 font-mono font-bold text-black dark:text-white text-sm">
                    {linea.numero}
                  </td>

                  {/* Personal Asignado */}
                  <td className="px-5 py-4">
                    {linea.personal_nombre ? (
                      <div>
                        <p className="font-bold text-black dark:text-white text-sm">
                          {linea.personal_nombre}
                        </p>
                        <p className="text-[10px] text-body-color dark:text-gray-400 mt-0.5">
                          {linea.personal_cargo} • {linea.personal_departamento}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        Disponible en Stock
                      </span>
                    )}
                  </td>

                  {/* Telefonía */}
                  <td className="px-5 py-4 font-bold text-primary">
                    <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {linea.telefonia_nombre || "N/A"}
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-black dark:text-white">
                      {linea.plan_nombre || "N/A"}
                    </p>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                      Bs. {parseFloat(String(linea.plan_costo || 0)).toFixed(2)}/mes
                    </p>
                  </td>

                  {/* Equipo Celular */}
                  <td className="px-5 py-4">
                    {linea.celular_codigo ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-black dark:text-white text-xs flex items-center gap-1.5">
                          <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                            {linea.celular_codigo}
                          </span>
                          {linea.celular_modelo || linea.celular_nombre}
                        </span>
                        {(linea.celular_imei_asignado || linea.celular_imei_1) && (
                          <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                            IMEI{linea.celular_imei_2 && linea.sim_slot ? ` (SIM ${linea.sim_slot})` : ""}: {linea.celular_imei_asignado || linea.celular_imei_1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                        Solo Chip
                      </span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${getColorEstadoLinea(
                        linea.estado
                      )}`}
                    >
                      {getNombreEstadoLinea(linea.estado)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver Detalle */}
                      <button
                        onClick={() => onDetalle(linea)}
                        className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                        title="Ver Detalle"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Transferir a otro personal */}
                      {linea.estado !== "BAJA" && (
                        <button
                          onClick={() => onTransferir(linea)}
                          className="w-7 h-7 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Transferir / Reasignar a otro personal"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      )}

                      {/* Cambiar Plan */}
                      {linea.estado !== "BAJA" && (
                        <button
                          onClick={() => onCambiarPlan(linea)}
                          className="w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Cambiar Plan de Telefonía"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}

                      {/* Cambiar / Reemplazar Equipo Celular */}
                      {linea.estado !== "BAJA" && (
                        <button
                          onClick={() => onCambiarEquipo(linea)}
                          className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Cambiar / Reemplazar Equipo Celular"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}

                      {/* Ver Historial */}
                      <button
                        onClick={() => onHistorial(linea)}
                        className="w-7 h-7 rounded-lg bg-purple-500 hover:bg-purple-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                        title="Historial de Movimientos y Cambios de Equipo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {/* Editar */}
                      {linea.estado !== "BAJA" && (
                        <button
                          onClick={() => onEdicion(linea)}
                          className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}

                      {/* Dar de Baja */}
                      {linea.estado !== "BAJA" && (
                        <button
                          onClick={() => onBaja(linea)}
                          className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white inline-flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Dar de Baja"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron líneas telefónicas con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
