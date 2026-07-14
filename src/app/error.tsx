"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error capturado por límite global:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 dark:bg-black transition-colors duration-300">
      <div className="w-full max-w-md rounded-xl border border-stroke bg-white p-8 text-center shadow-lg dark:border-strokedark dark:bg-gray-dark">
        {/* Warning Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="mb-2 text-2xl font-bold text-black dark:text-white">
          Algo Salió Mal
        </h3>
        <p className="mb-6 text-sm text-body-color dark:text-gray-400">
          Se ha producido un error inesperado al procesar la solicitud.
        </p>

        {error.message && (
          <div className="mb-6 max-h-32 overflow-y-auto rounded-lg bg-red-50 p-3 text-left font-mono text-xs text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-100 dark:border-red-900/50">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-stroke bg-transparent px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
          >
            Ir al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
