"use client";

import { useState, useRef, useEffect } from "react";

interface OptionItem {
  id: string | number;
  label: string;
  sublabel?: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  label?: string;
  placeholder: string;
  value: string | number;
  options: OptionItem[];
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  required = false,
  disabled = false,
  onChange,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (id: string | number) => {
    onChange(id.toString());
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="mb-3 block text-xs font-bold text-dark dark:text-white">
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500 font-medium"}>
          {selectedOption 
            ? `${selectedOption.sublabel ? `${selectedOption.sublabel} — ` : ''}${selectedOption.label}`
            : placeholder
          }
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full z-[9999] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-dark shadow-xl backdrop-blur-md overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-black/5 dark:border-white/5">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full text-xs rounded-lg border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/50 py-1.5 pl-8 pr-3 text-black dark:text-white outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 flex flex-col ${
                      value?.toString() === opt.id.toString()
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                        {opt.sublabel}
                      </span>
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic text-center">
                No se encontraron resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
