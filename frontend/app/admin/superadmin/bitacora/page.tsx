"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import {
  superadminService,
  BitacoraEntry,
  BitacoraStats,
} from "@/services/superadmin.service";

const ACCIONES = ["INSERT", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];

export default function BitacoraPage() {
  const { showLoading, hideLoading } = useLoading();

  const [registros, setRegistros] = useState<BitacoraEntry[]>([]);
  const [stats, setStats] = useState<BitacoraStats | null>(null);
  const [tablas, setTablas] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  const [filtroTabla, setFiltroTabla] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 50;

  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Bitácora de Auditoría | SuperAdmin";
    cargarStats();
    cargarTablas();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [filtroTabla, filtroAccion, pagina]);

  const cargarStats = async () => {
    try {
      const data = await superadminService.getBitacoraStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarTablas = async () => {
    try {
      const data = await superadminService.getBitacoraTables();
      setTablas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarRegistros = async () => {
    showLoading();
    try {
      const data = await superadminService.getBitacora({
        tabla: filtroTabla || undefined,
        accion: filtroAccion || undefined,
        limit: POR_PAGINA,
        offset: pagina * POR_PAGINA,
      });
      setRegistros(data.registros);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoading();
    }
  };

  const colorAccion = (accion: string) => {
    switch (accion) {
      case "INSERT": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "UPDATE": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "DELETE": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "LOGIN":  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:       return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <>
      <Breadcrumb
        pageName="Bitácora de Auditoría"
        description="Historial completo de todas las acciones realizadas en el sistema"
      />

      <section className="pb-[120px] pt-[80px]">
        <div className="container">

          {/* Stats */}
          {stats && (
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-gray-dark">
                <p className="text-3xl font-bold text-black dark:text-white">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-body-color">Total de registros</p>
              </div>
              <div className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-gray-dark">
                <p className="text-3xl font-bold text-primary">{stats.ultimas_24h.toLocaleString()}</p>
                <p className="text-sm text-body-color">Últimas 24 horas</p>
              </div>
              <div className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-gray-dark col-span-2">
                <p className="mb-2 text-xs font-bold uppercase text-body-color">Por acción</p>
                <div className="flex flex-wrap gap-2">
                  {stats.por_accion.map((a) => (
                    <span key={a.accion} className={`rounded-full px-3 py-1 text-xs font-semibold ${colorAccion(a.accion)}`}>
                      {a.accion}: {a.total}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-4">
            <select
              value={filtroTabla}
              onChange={(e) => { setFiltroTabla(e.target.value); setPagina(0); }}
              className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm dark:border-strokedark dark:bg-gray-dark dark:text-white"
            >
              <option value="">Todas las tablas</option>
              {tablas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filtroAccion}
              onChange={(e) => { setFiltroAccion(e.target.value); setPagina(0); }}
              className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm dark:border-strokedark dark:bg-gray-dark dark:text-white"
            >
              <option value="">Todas las acciones</option>
              {ACCIONES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <span className="ml-auto self-center text-sm text-body-color">
              {total.toLocaleString()} registros
            </span>
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-gray-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Tabla</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">ID Registro</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">IP</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-body-color">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-body-color">
                        No hay registros
                      </td>
                    </tr>
                  ) : registros.map((r) => (
                    <>
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-xs text-body-color whitespace-nowrap">
                          {new Date(r.fecha).toLocaleString('es-PE')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colorAccion(r.accion)}`}>
                            {r.accion}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-black dark:text-white">{r.tabla_afectada}</td>
                        <td className="px-4 py-3 text-center text-xs text-body-color">{r.registro_id ?? '—'}</td>
                        <td className="px-4 py-3">
                          {r.usuario_nombre ? (
                            <div>
                              <p className="text-xs font-medium text-black dark:text-white">{r.usuario_nombre}</p>
                              <p className="text-xs text-body-color">{r.usuario_email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-body-color">Sistema</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-body-color">{r.ip_usuario ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {(r.datos_anteriores || r.datos_nuevos) && (
                            <button
                              onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                              className="text-primary hover:underline text-xs"
                            >
                              {expandido === r.id ? 'Ocultar' : 'Ver'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandido === r.id && (
                        <tr key={`${r.id}-detail`} className="bg-gray-50 dark:bg-gray-800/30">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {r.datos_anteriores && (
                                <div>
                                  <p className="mb-1 text-xs font-bold uppercase text-red-500">Antes</p>
                                  <pre className="overflow-x-auto rounded bg-red-50 p-3 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    {JSON.stringify(r.datos_anteriores, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {r.datos_nuevos && (
                                <div>
                                  <p className="mb-1 text-xs font-bold uppercase text-green-500">Después</p>
                                  <pre className="overflow-x-auto rounded bg-green-50 p-3 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                    {JSON.stringify(r.datos_nuevos, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="rounded-lg border border-stroke px-4 py-2 text-sm disabled:opacity-40 dark:border-strokedark dark:text-white"
              >
                ← Anterior
              </button>
              <span className="text-sm text-body-color">
                Página {pagina + 1} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                disabled={pagina >= totalPaginas - 1}
                className="rounded-lg border border-stroke px-4 py-2 text-sm disabled:opacity-40 dark:border-strokedark dark:text-white"
              >
                Siguiente →
              </button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
