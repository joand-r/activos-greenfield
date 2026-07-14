"use client";

import Breadcrumb from "@/components/ui/Common/Breadcrumb";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { superadminService, BackupInfo } from "@/services/superadmin.service";

export default function BackupsPage() {
  const { showLoading, hideLoading } = useLoading();
  const [info, setInfo] = useState<BackupInfo | null>(null);

  useEffect(() => {
    document.title = "Backups y Base de Datos | Seguridad";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const backupData = await superadminService.getBackupsInfo();
      setInfo(backupData);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Base de Datos y Backups"
        description="Estado de la base de datos y configuración de backups"
      />

      <section className="pb-16 pt-6">
        <div className="container">
          {info && (
            <div className="space-y-6">
              {/* Configuración */}
              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-body-color/70">
                  ⚙️ Configuración de Backups
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(info.config).map(([key, val]) => (
                    <div key={key} className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 p-4">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-body-color/70">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs font-semibold text-black dark:text-white">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-black/5 dark:border-white/5 bg-yellow-50/50 dark:bg-yellow-900/10 p-4">
                  <p className="text-xs text-yellow-800 dark:text-yellow-400">
                    <strong>ℹ️ Nota:</strong> Los backups se ejecutan automáticamente vía GitHub Actions.
                    Verifica el estado en el repositorio → Actions → <em>🗄️ PostgreSQL Backup</em>.
                  </p>
                </div>
              </div>

              {/* Estado DB */}
              <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-body-color/70">
                    🗄️ Estado de la Base de Datos
                  </h3>
                  <span className="rounded-xl bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600">
                    {info.base_de_datos.tamaño_total} total
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md">
                  <table className="w-full text-xs">
                    <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Tabla</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Tamaño</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">Columnas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {info.base_de_datos.tablas.map((t) => (
                        <tr key={t.table_name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-2.5 font-mono font-medium text-black dark:text-white">{t.table_name}</td>
                          <td className="px-6 py-2.5 text-right text-body-color dark:text-gray-400 font-semibold">{t.size}</td>
                          <td className="px-6 py-2.5 text-right text-body-color dark:text-gray-400 font-semibold">{t.columnas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
