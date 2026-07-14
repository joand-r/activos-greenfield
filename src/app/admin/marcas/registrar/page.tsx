"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarMarcaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/marcas/lista");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-body-color dark:text-gray-400">Redireccionando...</p>
    </div>
  );
}
