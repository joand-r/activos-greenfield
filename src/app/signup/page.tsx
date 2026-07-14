"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignupPage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const [hostname, setHostname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(nombre, email, password);
      setSuccess("Cuenta creada exitosamente. Redirigiendo...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    }
  };

  return (
    <>
      {/* Fondo inmersivo con gradientes abstractos premium */}
      <div className="relative min-h-screen w-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
        
        {/* Luces de fondo (Blobs) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

        {/* Tarjeta de registro premium glassmorphism */}
        <div className="relative w-full max-w-[450px] rounded-2xl bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl p-8 sm:p-10 transition-all duration-300">
          
          {/* Logo y Encabezado */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-3 relative h-14 w-14 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-gray-dark/50 border border-black/5 dark:border-white/5 shadow-sm p-2.5">
              <Image
                src="/images/logo/greenfield-negro.png"
                alt="Logo"
                width={40}
                height={40}
                className="dark:hidden"
                style={{ height: "auto" }}
              />
              <Image
                src="/images/logo/greenfield-blanco.png"
                alt="Logo"
                width={40}
                height={40}
                className="hidden dark:block"
                style={{ height: "auto" }}
              />
            </div>
            <h3 className="text-lg font-black text-black dark:text-white tracking-wide">
              Crear Cuenta
            </h3>
            <p className="text-[10px] text-body-color/70 dark:text-gray-400 font-semibold mt-0.5">
              REGÍSTRATE EN EL SISTEMA DE ACTIVOS
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-red-700 dark:text-red-400 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-[11px] text-green-700 dark:text-green-400 font-semibold">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-xs font-bold text-dark dark:text-white"
              >
                Nombre Completo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-color/70 dark:text-gray-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  required
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.2 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-bold text-dark dark:text-white"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-color/70 dark:text-gray-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.2 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-bold text-dark dark:text-white"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-color/70 dark:text-gray-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.2 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-xs font-bold text-dark dark:text-white"
              >
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-color/70 dark:text-gray-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  required
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.2 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 py-3 text-xs font-bold text-white shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                <span>Crear Cuenta</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            </div>
          </form>

          <p className="text-center text-xs font-semibold text-body-color/70 dark:text-gray-400 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/signin" className="text-primary hover:text-primary/80 hover:underline transition">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
