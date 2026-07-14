import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        
        {/* Texto de carga */}
        <p className="mt-4 text-lg font-medium text-white">Cargando...</p>
      </div>
    </div>
  );
};

export default Loading;
