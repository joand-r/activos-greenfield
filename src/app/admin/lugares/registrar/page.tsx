"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarLugarRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/lugares/lista");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-body-color dark:text-gray-400">Redireccionando...</p>
    </div>
  );
}
