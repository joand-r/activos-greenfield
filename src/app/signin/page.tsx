"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de bloqueo / seguridad
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [hostname, setHostname] = useState("");

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Establecer hostname en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  // Verificar intentos y bloqueo
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem("signin_lockout_until");
      if (lockoutUntil) {
        const remaining = Math.ceil((new Date(lockoutUntil).getTime() - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutTimeLeft(remaining);
        } else {
          localStorage.removeItem("signin_lockout_until");
          localStorage.removeItem("signin_attempts");
          setLockoutTimeLeft(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Verificar bloqueo
    if (lockoutTimeLeft > 0) {
      setError(`Has superado el límite de intentos. Bloqueo activo por ${lockoutTimeLeft} segundos.`);
      return;
    }

    // 2. Saneamiento de entradas (anti SQLi / XSS)
    const invalidCharsRegex = /[<>'"]/g;
    if (invalidCharsRegex.test(email) || invalidCharsRegex.test(password) || email.includes("--") || password.includes("--")) {
      setError("Entrada inválida. No se permiten caracteres especiales sospechosos (<, >, ', \", o --).");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      
      // Limpiar intentos al iniciar sesión correctamente
      localStorage.removeItem("signin_attempts");
      localStorage.removeItem("signin_lockout_until");
      
      // Redirigir de forma completa para limpiar el estado de Next.js
      window.location.href = "/";
    } catch (err: any) {
      // Incrementar intentos fallidos
      const attempts = Number(localStorage.getItem("signin_attempts") || 0) + 1;
      localStorage.setItem("signin_attempts", String(attempts));

      if (attempts >= 5) {
        const lockoutDuration = 15 * 60 * 1000; // 15 minutos
        const lockoutDate = new Date(Date.now() + lockoutDuration).toISOString();
        localStorage.setItem("signin_lockout_until", lockoutDate);
        setLockoutTimeLeft(15 * 60);
        setError("Has fallado 5 intentos. Tu acceso ha sido bloqueado por 15 minutos por seguridad.");
      } else {
        setError(
          err.message || `Credenciales incorrectas. Intento ${attempts} de 5 antes de bloqueo.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Pantalla de carga y verificación de sesión segura */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm text-white animate-fadeIn">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <svg className="h-8 w-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold tracking-wide animate-pulse">Iniciando Sesión</h4>
        </div>
      )}

      {/* Fondo inmersivo con gradientes abstractos premium */}
      <div className="relative min-h-screen w-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-300">
        
        {/* Luces de fondo (Blobs) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

        {/* Tarjeta de acceso premium glassmorphism */}
        <div className="relative w-full max-w-[450px] rounded-2xl bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/5 backdrop-blur-md shadow-2xl p-8 sm:p-10 transition-all duration-300">
          

          {/* Logo y Encabezado */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 relative h-16 w-16 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-gray-dark/50 border border-black/5 dark:border-white/5 shadow-sm p-3">
              <Image
                src="/images/logo/greenfield-negro.png"
                alt="Logo"
                width={50}
                height={50}
                className="dark:hidden"
                style={{ height: "auto" }}
              />
              <Image
                src="/images/logo/greenfield-blanco.png"
                alt="Logo"
                width={50}
                height={50}
                className="hidden dark:block"
                style={{ height: "auto" }}
              />
            </div>
            <h3 className="text-xl font-black text-black dark:text-white tracking-wide">
              GREENFIELD
            </h3>
            <p className="text-[11px] text-body-color/70 dark:text-gray-400 font-semibold mt-1">
              SISTEMA DE GESTIÓN DE ACTIVOS
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-red-700 dark:text-red-400 font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
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
                  disabled={lockoutTimeLeft > 0}
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-bold text-dark dark:text-white"
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
                  disabled={lockoutTimeLeft > 0}
                  className="w-full rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 pl-11 pr-4 text-xs text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div>
              <button 
                type="submit"
                disabled={lockoutTimeLeft > 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 py-3 text-xs font-bold text-white shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none transition-all duration-300">
                <span>{lockoutTimeLeft > 0 ? `Bloqueado (${lockoutTimeLeft}s)` : "Iniciar Sesión"}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Modal de contraseña olvidada */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-dark-bg border border-black/5 dark:border-white/5 p-6 shadow-2xl animate-scaleIn text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-1 text-lg font-bold text-black dark:text-white">
                ¿Olvidaste tu contraseña?
              </h3>
              <p className="mb-4 text-xs text-body-color/80 dark:text-gray-400">
                Contacta al desarrollador del sistema para restablecer tu acceso.
              </p>
              <div className="mb-5 rounded-xl bg-gray-50/50 dark:bg-gray-dark/30 border border-black/5 dark:border-white/5 p-4">
                <p className="text-[10px] font-bold text-body-color/70 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                  Administrador
                </p>
                <p className="text-sm font-bold text-black dark:text-white">
                  Joan Robles
                </p>
                <a 
                  href="tel:+60864448"
                  className="inline-block mt-2 text-lg font-black text-primary hover:underline"
                >
                  +60864448
                </a>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full rounded-xl bg-primary hover:bg-primary/95 py-2.5 text-xs font-bold text-white transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
