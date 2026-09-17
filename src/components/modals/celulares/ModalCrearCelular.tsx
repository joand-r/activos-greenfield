"use client";

import React from "react";
import { Lugar } from "@/services/lugar.service";
import { Marca } from "@/services/marca.service";
import { Proveedor } from "@/services/proveedor.service";

export interface DatosNuevoCelular {
  nombre: string;
  modelo: string;
  marca_id: string;
  lugar_id: string;
  proveedor_id: string;
  serie: string;
  memoria: string;
  capacidad_disco: string;
  procesador: string;
  imei_1: string;
  imei_2: string;
  accesorios: string;
  fecha_adquision: string;
  costo_adquision: string;
}

interface ModalCrearCelularProps {
  isOpen: boolean;
  onClose: () => void;
  datosNuevoCelular: DatosNuevoCelular;
  setDatosNuevoCelular: React.Dispatch<React.SetStateAction<DatosNuevoCelular>>;
  lugares: Lugar[];
  marcas: Marca[];
  proveedores: Proveedor[];
  onSubmit: (e: React.FormEvent) => void;
  guardando?: boolean;
}

export const ModalCrearCelular: React.FC<ModalCrearCelularProps> = ({
  isOpen,
  onClose,
  datosNuevoCelular,
  setDatosNuevoCelular,
  lugares,
  marcas,
  proveedores,
  onSubmit,
  guardando = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Header fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-3.5 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-black dark:text-white leading-tight">
                Registrar Nuevo Equipo Celular
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Se guardará en el inventario de celulares
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario con cuerpo scrolleable y footer fijo */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Nombre del Dispositivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.nombre}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, nombre: e.target.value })
                  }
                  placeholder="Ej: Samsung Galaxy A54"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.modelo}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, modelo: e.target.value })
                  }
                  placeholder="Ej: SM-A546E / 128GB"
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Ubicación / Lugar <span className="text-red-500">*</span>
                </label>
                <select
                  value={datosNuevoCelular.lugar_id}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, lugar_id: e.target.value })
                  }
                  required
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Seleccionar Ubicación --</option>
                  {lugares.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre} ({l.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Marca
                </label>
                <select
                  value={datosNuevoCelular.marca_id}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, marca_id: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Seleccionar Marca --</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.serie}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, serie: e.target.value })
                  }
                  placeholder="Ej: R58N71ABCDE"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Procesador
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.procesador}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, procesador: e.target.value })
                  }
                  placeholder="Ej: Octa-Core 2.4 GHz"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Memoria RAM
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.memoria}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, memoria: e.target.value })
                  }
                  placeholder="Ej: 8 GB"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Almacenamiento Interno
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.capacidad_disco}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, capacidad_disco: e.target.value })
                  }
                  placeholder="Ej: 128 GB o 256 GB"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  IMEI 1
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.imei_1}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, imei_1: e.target.value })
                  }
                  placeholder="Ej: 358943112345678"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  IMEI 2 (Opcional)
                </label>
                <input
                  type="text"
                  value={datosNuevoCelular.imei_2}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, imei_2: e.target.value })
                  }
                  placeholder="Ej: 358943112345679"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1">
                Accesorios Incluidos
              </label>
              <input
                type="text"
                value={datosNuevoCelular.accesorios}
                onChange={(e) =>
                  setDatosNuevoCelular({ ...datosNuevoCelular, accesorios: e.target.value })
                }
                placeholder="Ej: Cargador original, funda transparente, cable Tipo-C"
                className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Proveedor
                </label>
                <select
                  value={datosNuevoCelular.proveedor_id}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, proveedor_id: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                >
                  <option value="">-- Proveedor --</option>
                  {proveedores.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Fecha Compra
                </label>
                <input
                  type="date"
                  value={datosNuevoCelular.fecha_adquision}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, fecha_adquision: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1">
                  Costo (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={datosNuevoCelular.costo_adquision}
                  onChange={(e) =>
                    setDatosNuevoCelular({ ...datosNuevoCelular, costo_adquision: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5 shrink-0">
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
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary/15"
            >
              {guardando ? "Guardando..." : "Guardar y Asignar Celular"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
