import React from "react";

interface ActivoImagenUploaderProps {
  imagenPreview: string;
  subiendoImagen: boolean;
  onImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onEliminarImagen: () => void;
}

export const ActivoImagenUploader: React.FC<ActivoImagenUploaderProps> = ({
  imagenPreview,
  subiendoImagen,
  onImagenChange,
  onEliminarImagen,
}) => {
  return (
    <div className="md:col-span-2">
      <label
        htmlFor="imagen"
        className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
      >
        Imagen del Activo
      </label>

      {!imagenPreview ? (
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="imagen-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {subiendoImagen ? (
                <>
                  <svg className="w-10 h-10 mb-3 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subiendo imagen...</p>
                </>
              ) : (
                <>
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click para subir</span> o arrastra la imagen
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
                </>
              )}
            </div>
            <input
              id="imagen-upload"
              type="file"
              accept="image/*"
              onChange={onImagenChange}
              disabled={subiendoImagen}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imagenPreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border-2 border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={onEliminarImagen}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all cursor-pointer"
            title="Eliminar imagen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            ✓ Imagen subida correctamente
          </div>
        </div>
      )}
    </div>
  );
};
