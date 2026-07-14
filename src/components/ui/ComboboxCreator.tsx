"use client";

import { useState, useRef, useEffect } from "react";
import { lugarService, TipoLugar, getNombreTipoLugar } from "@/services/lugar.service";
import { marcaService } from "@/services/marca.service";
import { proveedorService } from "@/services/proveedor.service";

interface OptionItem {
  id: number;
  nombre: string;
  [key: string]: any;
}

interface ComboboxCreatorProps {
  label: string;
  placeholder: string;
  value: string | number;
  options: OptionItem[];
  type: "lugar" | "marca" | "proveedor";
  required?: boolean;
  onChange: (value: string) => void;
  onCreated: () => Promise<void>;
}

export default function ComboboxCreator({
  label,
  placeholder,
  value,
  options,
  type,
  required = false,
  onChange,
  onCreated,
}: ComboboxCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for mini creation modal
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [creando, setCreando] = useState(false);
  
  // Lugar specific fields
  const [lugarTipo, setLugarTipo] = useState<TipoLugar>("ALMACEN");
  const [lugarInicial, setLugarInicial] = useState("");

  // Proveedor specific fields
  const [proveedorNit, setProveedorNit] = useState("");

  // Auto-calculate initials for Lugar when typing name
  useEffect(() => {
    if (type === "lugar" && nombreNuevo) {
      const parts = nombreNuevo.trim().split(/\s+/);
      let initials = "";
      if (parts.length >= 2) {
        initials = parts.map(p => p[0]).join("").toUpperCase();
      } else {
        initials = nombreNuevo.substring(0, 3).toUpperCase();
      }
      setLugarInicial(initials.substring(0, 5));
    }
  }, [nombreNuevo, type]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id.toString() === value?.toString());

  const filteredOptions = options.filter((opt) =>
    opt.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: number) => {
    onChange(id.toString());
    setIsOpen(false);
    setSearch("");
  };

  const handleOpenCreateModal = () => {
    setNombreNuevo(search);
    setIsOpen(false);
    setShowCreateModal(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleCreateSubmit(e);
    }
  };

  const handleCreateSubmit = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!nombreNuevo.trim()) return;

    setCreando(true);
    try {
      let newItemId = "";

      if (type === "lugar") {
        const created = await lugarService.create({
          nombre: nombreNuevo.trim(),
          tipo: lugarTipo,
          inicial: lugarInicial.trim() || "LOC",
        });
        newItemId = created.id.toString();
      } else if (type === "marca") {
        const created = await marcaService.create({
          nombre: nombreNuevo.trim(),
        });
        newItemId = created.id.toString();
      } else if (type === "proveedor") {
        const created = await proveedorService.create({
          nombre: nombreNuevo.trim(),
          nit: proveedorNit.trim() || "0",
        });
        newItemId = created.id.toString();
      }

      // Refresh parent selects data list
      await onCreated();
      
      // Auto select the new option
      onChange(newItemId);
      
      // Close and reset modal state
      setShowCreateModal(false);
      setNombreNuevo("");
      setLugarInicial("");
      setProveedorNit("");
    } catch (error) {
      console.error("Error al crear item en combobox:", error);
      alert("Ocurrió un error al crear. Por favor intenta de nuevo.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 block text-xs font-bold text-dark dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all flex items-center justify-between cursor-pointer select-none"
      >
        <span className={selectedOption ? "text-black dark:text-white" : "text-gray-400"}>
          {selectedOption ? selectedOption.nombre : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Custom Options Dropdown */}
      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full rounded-xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-gray-dark/95 backdrop-blur-md shadow-xl p-2.5 space-y-1">
          {/* Inner Search Box */}
          <input
            type="text"
            placeholder={`Buscar ${type}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-black/5 dark:border-white/10 bg-gray-100/50 dark:bg-gray-800/50 py-2 px-3 mb-2 outline-none focus:border-primary focus:bg-white dark:focus:bg-gray-900 text-black dark:text-white transition-all"
            autoFocus
          />

          {/* List options */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left text-xs rounded-lg px-3 py-2 transition-all cursor-pointer ${
                    opt.id.toString() === value?.toString()
                      ? "bg-primary/20 text-primary dark:text-emerald-400 font-bold"
                      : "text-black dark:text-white hover:bg-primary/5 dark:hover:bg-primary/10"
                  }`}
                >
                  {opt.nombre} {opt.inicial ? `(${opt.inicial})` : ""}
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center">
                No se encontraron resultados
              </div>
            )}
          </div>

          {/* Create Button Inline Option */}
          {search.trim().length > 0 && (
            <div className="border-t border-black/5 dark:border-white/5 pt-1.5 mt-1">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full text-left text-xs font-bold text-primary dark:text-emerald-400 hover:bg-primary/5 dark:hover:bg-primary/10 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Crear &quot;{search}&quot;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mini Creation Modal Popup */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-gray-dark shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-black dark:text-white mb-4 uppercase tracking-wider">
              Registrar {type}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} required onKeyDown={handleKeyDown} className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                />
              </div>

              {/* Lugar extra inputs */}
              {type === "lugar" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Sigla/Inicial
                      </label>
                      <input
                        type="text"
                        value={lugarInicial} onChange={(e) => setLugarInicial(e.target.value.toUpperCase())} required maxLength={5} onKeyDown={handleKeyDown} className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Tipo
                      </label>
                      <select
                        value={lugarTipo}
                        onChange={(e) => setLugarTipo(e.target.value as TipoLugar)}
                        className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                      >
                        <option value="ALMACEN">{getNombreTipoLugar("ALMACEN")}</option>
                        <option value="VIVIENDA">{getNombreTipoLugar("VIVIENDA")}</option>
                        <option value="OFICINA">{getNombreTipoLugar("OFICINA")}</option>
                        <option value="CENTER">{getNombreTipoLugar("CENTER")}</option>
                        <option value="PROPIEDAD">{getNombreTipoLugar("PROPIEDAD")}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Proveedor extra inputs */}
              {type === "proveedor" && (
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    NIT/RUC
                  </label>
                  <input
                    type="text"
                    value={proveedorNit} onChange={(e) => setProveedorNit(e.target.value)} required placeholder="Ej: 20601234567" onKeyDown={handleKeyDown} className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2 px-3 text-black dark:text-white outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-stroke dark:border-gray-800 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button" onClick={() => handleCreateSubmit()} disabled={creando} className="rounded-xl bg-primary hover:bg-primary/95 text-white px-4 py-2 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {creando ? "Guardando..." : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
