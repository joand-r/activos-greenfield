import React from "react";
import ComboboxCreator from "@/components/ui/ComboboxCreator";
import { Lugar } from "@/services/lugar.service";
import { Marca } from "@/services/marca.service";
import { Proveedor } from "@/services/proveedor.service";
import { getNombreEstadoActivo } from "@/services/activo.service";
import { ActivoImagenUploader } from "./ActivoImagenUploader";

interface InformacionBasicaSectionProps {
  formData: {
    nombre: string;
    serie: string;
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
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLugarChange: (lugarId: string) => void;
  onMarcaChange: (marcaId: string) => void;
  onProveedorChange: (proveedorId: string) => void;
  lugares: Lugar[];
  marcas: Marca[];
  proveedores: Proveedor[];
  codigoProximo: string;
  cargandoCodigo: boolean;
  onReloadSelects: () => Promise<void>;
  mostrarMarcaProveedor: boolean;
  imagenPreview: string;
  subiendoImagen: boolean;
  onImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onEliminarImagen: () => void;
}

export const InformacionBasicaSection: React.FC<InformacionBasicaSectionProps> = ({
  formData,
  onChange,
  onLugarChange,
  onMarcaChange,
  onProveedorChange,
  lugares,
  marcas,
  proveedores,
  codigoProximo,
  cargandoCodigo,
  onReloadSelects,
  mostrarMarcaProveedor,
  imagenPreview,
  subiendoImagen,
  onImagenChange,
  onEliminarImagen,
}) => {
  return (
    <div className="mb-8 p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2">
        2. Información Básica
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label
            htmlFor="nombre"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Nombre del Activo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={formData.nombre}
            onChange={onChange}
            placeholder="Ej: Laptop Dell Inspiron"
            required
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="estado"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Estado
          </label>
          <select
            name="estado"
            id="estado"
            value={formData.estado}
            onChange={onChange}
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          >
            <option value="NUEVO">{getNombreEstadoActivo("NUEVO")}</option>
            <option value="USADO">{getNombreEstadoActivo("USADO")}</option>
            <option value="DISPONIBLE">{getNombreEstadoActivo("DISPONIBLE")}</option>
            <option value="ASIGNADO">{getNombreEstadoActivo("ASIGNADO")}</option>
            <option value="DANADO">{getNombreEstadoActivo("DANADO")}</option>
            <option value="DESUSO">{getNombreEstadoActivo("DESUSO")}</option>
            <option value="DONADO">{getNombreEstadoActivo("DONADO")}</option>
            <option value="VENDIDO">{getNombreEstadoActivo("VENDIDO")}</option>
            <option value="TRANSFERIR">{getNombreEstadoActivo("TRANSFERIR")}</option>
          </select>
        </div>

        {/* Lugar */}
        <div>
          <ComboboxCreator
            label="Lugar"
            placeholder="-- Seleccione un lugar --"
            value={formData.lugar_id}
            options={lugares}
            type="lugar"
            required
            onChange={onLugarChange}
            onCreated={onReloadSelects}
          />

          {/* Código asignado */}
          {codigoProximo && (
            <div className="mt-3 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
              <p className="text-xs text-blue-800 dark:text-blue-400">
                <strong>Código que se asignará:</strong> {codigoProximo}
              </p>
            </div>
          )}

          {cargandoCodigo && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cargando código...
              </p>
            </div>
          )}
        </div>

        {/* Marca (si aplica) */}
        {mostrarMarcaProveedor && (
          <div>
            <ComboboxCreator
              label="Marca"
              placeholder="-- Seleccione una marca --"
              value={formData.marca_id}
              options={marcas}
              type="marca"
              onChange={onMarcaChange}
              onCreated={onReloadSelects}
            />
          </div>
        )}

        {/* Proveedor (si aplica) */}
        {mostrarMarcaProveedor && (
          <div>
            <ComboboxCreator
              label="Proveedor"
              placeholder="-- Seleccione un proveedor --"
              value={formData.proveedor_id}
              options={proveedores}
              type="proveedor"
              onChange={onProveedorChange}
              onCreated={onReloadSelects}
            />
          </div>
        )}

        {/* Fecha de Adquisición */}
        <div>
          <label
            htmlFor="fecha_adquision"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Fecha de Adquisición
          </label>
          <input
            type="date"
            name="fecha_adquision"
            id="fecha_adquision"
            value={formData.fecha_adquision}
            onChange={onChange}
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>

        {/* Costo de Adquisición */}
        <div>
          <label
            htmlFor="costo_adquision"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Costo de Adquisición (S/)
          </label>
          <input
            type="number"
            step="0.01"
            name="costo_adquision"
            id="costo_adquision"
            value={formData.costo_adquision}
            onChange={onChange}
            placeholder="0.00"
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>

        {/* Nro. de Serie */}
        <div>
          <label
            htmlFor="serie"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Nro. de Serie
          </label>
          <input
            type="text"
            name="serie"
            id="serie"
            value={formData.serie}
            onChange={onChange}
            placeholder="Ej: SN-12345678"
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>

        {/* Imagen Uploader */}
        <ActivoImagenUploader
          imagenPreview={imagenPreview}
          subiendoImagen={subiendoImagen}
          onImagenChange={onImagenChange}
          onEliminarImagen={onEliminarImagen}
        />

        {/* Descripción */}
        <div className="md:col-span-2">
          <label
            htmlFor="descripcion"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Descripción
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            rows={3}
            value={formData.descripcion}
            onChange={onChange}
            placeholder="Describe el activo..."
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>

        {/* Tipo Constancia */}
        <div>
          <label
            htmlFor="tipo_constancia"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Tipo de Constancia
          </label>
          <select
            name="tipo_constancia"
            id="tipo_constancia"
            value={formData.tipo_constancia}
            onChange={onChange}
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          >
            <option value="">Seleccionar...</option>
            <option value="FACTURA">Factura</option>
            <option value="PROFORMA">Proforma</option>
            <option value="RECIBO">Recibo</option>
          </select>
        </div>

        {/* Nro Constancia */}
        <div>
          <label
            htmlFor="nro_constancia"
            className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
          >
            Número de Constancia
          </label>
          <input
            type="text"
            name="nro_constancia"
            id="nro_constancia"
            value={formData.nro_constancia}
            onChange={onChange}
            placeholder="Ej: 001-001234"
            className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
          />
        </div>
      </div>
    </div>
  );
};
