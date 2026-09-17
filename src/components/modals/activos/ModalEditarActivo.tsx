"use client";

import React from "react";
import {
  Activo,
  ClasificacionActivo,
  getNombreTipoActivo,
  esActivoSimple,
  requiereMarcaProveedor,
} from "@/services/activo.service";
import { Lugar } from "@/services/lugar.service";
import { Marca } from "@/services/marca.service";
import { Proveedor } from "@/services/proveedor.service";

export interface EditActivoFormData {
  nombre: string;
  clasificacion: ClasificacionActivo;
  imagen: string;
  estado: string;
  descripcion: string;
  fecha_adquision: string;
  costo_adquision: string;
  tipo_constancia: string;
  nro_constancia: string;
  lugar_id: string;
  marca_id: string;
  proveedor_id: string;
}

interface ModalEditarActivoProps {
  isOpen: boolean;
  activo: Activo | null;
  cargando: boolean;
  formData: EditActivoFormData;
  setFormData: React.Dispatch<React.SetStateAction<EditActivoFormData>>;
  lugares: Lugar[];
  marcas: Marca[];
  proveedores: Proveedor[];
  imagenPreview: string;
  setImagenPreview: React.Dispatch<React.SetStateAction<string>>;
  subiendoImagen: boolean;
  onImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  camposEquipoTec: { modelo: string; procesador: string; memoria: string; capacidad_disco: string };
  setCamposEquipoTec: React.Dispatch<
    React.SetStateAction<{ modelo: string; procesador: string; memoria: string; capacidad_disco: string }>
  >;
  camposCelular: {
    modelo: string;
    procesador: string;
    memoria: string;
    capacidad_disco: string;
    imei_1: string;
    imei_2: string;
  };
  setCamposCelular: React.Dispatch<
    React.SetStateAction<{
      modelo: string;
      procesador: string;
      memoria: string;
      capacidad_disco: string;
      imei_1: string;
      imei_2: string;
    }>
  >;
  camposMotorizado: {
    tipo_vehiculo: string;
    motor: string;
    chasis: string;
    color: string;
    anho_modelo: string;
    placa: string;
  };
  setCamposMotorizado: React.Dispatch<
    React.SetStateAction<{
      tipo_vehiculo: string;
      motor: string;
      chasis: string;
      color: string;
      anho_modelo: string;
      placa: string;
    }>
  >;
  camposTerreno: { folio: string; nro_registro: string; area: string; ubicacion: string };
  setCamposTerreno: React.Dispatch<
    React.SetStateAction<{ folio: string; nro_registro: string; area: string; ubicacion: string }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const ModalEditarActivo: React.FC<ModalEditarActivoProps> = ({
  isOpen,
  activo,
  cargando,
  formData,
  setFormData,
  lugares,
  marcas,
  proveedores,
  imagenPreview,
  setImagenPreview,
  subiendoImagen,
  onImagenChange,
  camposEquipoTec,
  setCamposEquipoTec,
  camposCelular,
  setCamposCelular,
  camposMotorizado,
  setCamposMotorizado,
  camposTerreno,
  setCamposTerreno,
  onSubmit,
  onClose,
}) => {
  if (!isOpen || !activo) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-dark shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden my-auto animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Volver"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                Editar Activo [{activo.codigo}]
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activo.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-gray-500 mt-2">Cargando datos del activo...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              {/* Sección Lugar y Estado */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3">Ubicación y Estado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                      Lugar <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lugar_id"
                      value={formData.lugar_id}
                      onChange={handleInputChange}
                      required
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    >
                      <option value="">-- Seleccionar Lugar --</option>
                      {lugares.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nombre} ({l.inicial})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    >
                      <option value="NUEVO">Nuevo</option>
                      <option value="USADO">Usado</option>
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="DANADO">Dañado</option>
                      <option value="DONADO">Donado</option>
                      <option value="VENDIDO">Vendido</option>
                      <option value="TRANSFERIR">Por Transferir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección Información Básica */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Información Básica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre del activo"
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                      Clasificación <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="clasificacion"
                      value={formData.clasificacion}
                      onChange={handleInputChange}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    >
                      <option value="FIJO">Activo Fijo</option>
                      <option value="MENOR">Activo Menor</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Descripción</label>
                  <textarea
                    name="descripcion"
                    rows={2}
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción..."
                    className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark p-3 text-black dark:text-white outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Sección Adquisición */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Adquisición</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Fecha de Adquisición</label>
                    <input
                      type="date"
                      name="fecha_adquision"
                      value={formData.fecha_adquision}
                      onChange={handleInputChange}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Costo (Bs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="costo_adquision"
                      value={formData.costo_adquision}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                  {requiereMarcaProveedor(activo.tipo_activo) && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Marca</label>
                        <select
                          name="marca_id"
                          value={formData.marca_id}
                          onChange={handleInputChange}
                          className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                        >
                          <option value="">-- Sin marca --</option>
                          {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Proveedor</label>
                        <select
                          name="proveedor_id"
                          value={formData.proveedor_id}
                          onChange={handleInputChange}
                          className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                        >
                          <option value="">-- Sin proveedor --</option>
                          {proveedores.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Tipo de Constancia</label>
                    <select
                      name="tipo_constancia"
                      value={formData.tipo_constancia}
                      onChange={handleInputChange}
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="FACTURA">Factura</option>
                      <option value="PROFORMA">Proforma</option>
                      <option value="RECIBO">Recibo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">Nro. Constancia</label>
                    <input
                      type="text"
                      name="nro_constancia"
                      value={formData.nro_constancia}
                      onChange={handleInputChange}
                      placeholder="Ej: 001-001234"
                      className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Imagen */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Imagen del Activo</h4>
                {!imagenPreview ? (
                  <label htmlFor="edit-activo-img" className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center py-3">
                      {subiendoImagen ? (
                        <svg className="w-7 h-7 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="w-7 h-7 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-500">Click para subir foto (PNG, JPG, máx 5MB)</p>
                        </>
                      )}
                    </div>
                    <input id="edit-activo-img" type="file" accept="image/*" onChange={onImagenChange} disabled={subiendoImagen} className="hidden" />
                  </label>
                ) : (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagenPreview} alt="preview" className="w-full h-36 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPreview("");
                        setFormData((p) => ({ ...p, imagen: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg cursor-pointer transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Datos Específicos */}
              {!esActivoSimple(activo.tipo_activo) && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                    Datos Técnicos - {getNombreTipoActivo(activo.tipo_activo)}
                  </h4>
                  {activo.tipo_activo === "EQUIPO_TECNOLOGICO" && (
                    <div className="grid grid-cols-2 gap-3">
                      {(["modelo", "procesador", "memoria", "capacidad_disco"] as const).map((k) => (
                        <div key={k}>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                            {k === "capacidad_disco" ? "Almacenamiento" : k.replace("_", " ")}
                          </label>
                          <input
                            type="text"
                            value={camposEquipoTec[k]}
                            onChange={(e) => setCamposEquipoTec((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {activo.tipo_activo === "CELULAR" && (
                    <div className="grid grid-cols-2 gap-3">
                      {(["modelo", "procesador", "memoria", "capacidad_disco", "imei_1", "imei_2"] as const).map((k) => (
                        <div key={k}>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                            {k === "imei_1" ? "IMEI 1 (Opcional)" : k === "imei_2" ? "IMEI 2 (Opcional)" : k === "capacidad_disco" ? "Almacenamiento" : k.replace("_", " ")}
                          </label>
                          <input
                            type="text"
                            value={camposCelular[k]}
                            onChange={(e) => setCamposCelular((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {(activo.tipo_activo === "VEHICULO" || activo.tipo_activo === "MAQUINARIA") && (
                    <div className="grid grid-cols-2 gap-3">
                      {(["tipo_vehiculo", "motor", "chasis", "color", "anho_modelo", "placa"] as const).map((k) => (
                        <div key={k}>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                            {k.replace(/_/g, " ")}
                          </label>
                          <input
                            type={k === "anho_modelo" ? "number" : "text"}
                            value={camposMotorizado[k]}
                            onChange={(e) => setCamposMotorizado((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {activo.tipo_activo === "TERRENO" && (
                    <div className="grid grid-cols-2 gap-3">
                      {(["folio", "nro_registro", "area"] as const).map((k) => (
                        <div key={k}>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                            {k.replace("_", " ")}
                          </label>
                          <input
                            type={k === "area" ? "number" : "text"}
                            value={camposTerreno[k]}
                            onChange={(e) => setCamposTerreno((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Ubicación</label>
                        <textarea
                          rows={2}
                          value={camposTerreno.ubicacion}
                          onChange={(e) => setCamposTerreno((p) => ({ ...p, ubicacion: e.target.value }))}
                          className="w-full text-xs rounded-xl border border-stroke dark:border-gray-800 bg-white dark:bg-gray-dark p-3 text-black dark:text-white outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0 bg-gray-50/50 dark:bg-white/5">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">ID: #{activo.id}</p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
