"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    // Ejecutar el cierre de sesión
    logout();
    
    // Redirigir de forma segura tras 1.5 segundos
    const timer = setTimeout(() => {
      window.location.href = "/signin";
    }, 1500);

    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <div className="flex flex-col items-center max-w-sm text-center px-6">
        {/* Animated Icon */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-10 w-10 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
        </div>
        
        <h3 className="text-xl font-bold text-black dark:text-white">
          Cerrando Sesión
        </h3>
      </div>
    </div>
  );
}
