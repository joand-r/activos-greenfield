"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { superadminService, BackupInfo, UsuarioAdmin } from "@/services/superadmin.service";

export default function BackupsPage() {
  const { showLoading, hideLoading } = useLoading();
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [tabActiva, setTabActiva] = useState<"backups" | "usuarios">("backups");

  useEffect(() => {
    document.title = "Backups & Usuarios | SuperAdmin";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    showLoading();
    try {
      const [backupData, usuariosData] = await Promise.all([
        superadminService.getBackupsInfo(),
        superadminService.getUsuarios(),
      ]);
      setInfo(backupData);
      setUsuarios(usuariosData);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoading();
    }
  };

  const colorRol = (rol: string) => {
    switch (rol) {
      case "superadmin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "admin":      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:           return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Backups & Usuarios"
        description="Estado de la base de datos, configuración de backups y gestión de usuarios"
      />

      <section className="pb-[120px] pt-[80px]">
        <div className="container">

          {/* Tabs */}
          <div className="mb-8 flex gap-2 border-b border-stroke dark:border-strokedark">
            {(["backups", "usuarios"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActiva(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                  tabActiva === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-body-color hover:text-primary"
                }`}
              >
                {tab === "backups" ? "🗄️ Backups" : "👥 Usuarios"}
              </button>
            ))}
          </div>

          {/* ─── Tab Backups ─── */}
          {tabActiva === "backups" && info && (
            <div className="space-y-6">
              {/* Configuración */}
              <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-gray-dark">
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  ⚙️ Configuración de Backups
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(info.config).map(([key, val]) => (
                    <div key={key} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="mb-1 text-xs font-bold uppercase text-body-color">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-medium text-black dark:text-white">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>ℹ️ Nota:</strong> Los backups se ejecutan automáticamente vía GitHub Actions.
                    Verifica el estado en el repositorio → Actions → <em>Daily DB Backup</em>.
                  </p>
                </div>
              </div>

              {/* Estado DB */}
              <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-gray-dark">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    🗄️ Estado de la Base de Datos
                  </h3>
                  <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {info.base_de_datos.tamaño_total} total
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-body-color">Tabla</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-body-color">Tamaño</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-body-color">Columnas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {info.base_de_datos.tablas.map((t) => (
                        <tr key={t.table_name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-2 font-mono text-xs text-black dark:text-white">{t.table_name}</td>
                          <td className="px-4 py-2 text-right text-xs text-body-color">{t.size}</td>
                          <td className="px-4 py-2 text-right text-xs text-body-color">{t.columnas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab Usuarios ─── */}
          {tabActiva === "usuarios" && (
            <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-gray-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Email</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-body-color">Rol</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-body-color">Registrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke dark:divide-strokedark">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-black dark:text-white">{u.nombre}</td>
                        <td className="px-4 py-3 text-body-color">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorRol(u.rol)}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-body-color">
                          {new Date(u.created_at).toLocaleDateString('es-PE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
