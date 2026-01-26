"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Si no está autenticado, redirigir a login
      if (!isAuthenticated) {
        window.location.href = "/signin";
        return;
      }

      // Si requiere admin y no es admin, redirigir a home
      if (requireAdmin && user?.rol !== "admin") {
        window.location.href = "/";
        return;
      }

      // Si pasó todas las validaciones, permitir renderizar
      setShouldRender(true);
    }
  }, [loading, isAuthenticated, user, requireAdmin, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si no debe renderizar, no mostrar nada
  if (!shouldRender) {
    return null;
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
}
