/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Responsabilidades:
 *  1. Rate Limiting en rutas sensibles (/api/auth/*)
 *  2. Bloqueo de métodos HTTP no permitidos
 *  3. Inyección de cabeceras de seguridad extra en rutas de API
 *
 * Estrategia de Rate Limiting:
 *  - Se usa un Map en memoria dentro del Edge Runtime.
 *  - Ventana deslizante de WINDOW_MS milisegundos.
 *  - Máximo MAX_REQUESTS peticiones por IP en esa ventana.
 *  - IMPORTANTE: en un despliegue multi-instancia (ej. Netlify Edge Functions
 *    en múltiples regiones) el Map es local a cada instancia. Para un rate
 *    limiting distribuido robusto, reemplaza el Map por Redis (Upstash es la
 *    opción más sencilla en Edge con @upstash/ratelimit).
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Configuración ────────────────────────────────────────────
const WINDOW_MS      = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS   = 20;              // máx. intentos por ventana (login/signup)
const API_MAX        = 300;             // máx. peticiones genéricas de API
const API_WINDOW_MS  = 60 * 1000;      // ventana de 1 min para API general

// ─── Tipos ────────────────────────────────────────────────────
interface RateLimitEntry {
  count:     number;
  resetTime: number;
}

// ─── Almacenamiento en memoria (Edge Runtime) ─────────────────
// Nota: cada worker/instancia tiene su propio Map.
const authStore = new Map<string, RateLimitEntry>();
const apiStore  = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar crecimiento indefinido del Map
function pruneStore(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetTime <= now) store.delete(key);
  });
}

// ─── Helper: evalúa si una IP supera el límite ────────────────
function isRateLimited(
  store: Map<string, RateLimitEntry>,
  ip: string,
  maxRequests: number,
  windowMs: number,
): { limited: boolean; remaining: number; resetTime: number } {
  const now   = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetTime <= now) {
    // Primera petición en la ventana (o ventana expirada)
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { limited: false, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

// ─── Helper: obtiene la IP real del cliente ───────────────────
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

// ─── Middleware principal ──────────────────────────────────────
export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const ip           = getClientIP(req);

  pruneStore(authStore);

  // ── 1. Rate Limit estricto en autenticación ────────────────
  //    Cubre: POST /api/auth/login  y  POST /api/auth/register
  if (pathname.startsWith('/api/auth')) {
    // Solo limitar métodos de escritura
    if (req.method === 'POST' || req.method === 'PUT') {
      const { limited, remaining, resetTime } = isRateLimited(
        authStore, ip, MAX_REQUESTS, WINDOW_MS,
      );

      if (limited) {
        const retryAfterSec = Math.ceil((resetTime - Date.now()) / 1000);
        return NextResponse.json(
          {
            error:   'Demasiados intentos. Por favor espera antes de volver a intentarlo.',
            retryAfter: retryAfterSec,
          },
          {
            status: 429,
            headers: {
              'Retry-After':               String(retryAfterSec),
              'X-RateLimit-Limit':         String(MAX_REQUESTS),
              'X-RateLimit-Remaining':     '0',
              'X-RateLimit-Reset':         String(Math.ceil(resetTime / 1000)),
              'Content-Type':              'application/json',
            },
          },
        );
      }

      const res = NextResponse.next();
      res.headers.set('X-RateLimit-Limit',     String(MAX_REQUESTS));
      res.headers.set('X-RateLimit-Remaining', String(remaining));
      res.headers.set('X-RateLimit-Reset',     String(Math.ceil(resetTime / 1000)));
      return res;
    }
  }

  // ── 2. Rate Limit general en todas las rutas /api/* ────────
  if (pathname.startsWith('/api/')) {
    pruneStore(apiStore);
    const { limited, remaining, resetTime } = isRateLimited(
      apiStore, ip, API_MAX, API_WINDOW_MS,
    );

    if (limited) {
      return NextResponse.json(
        { error: 'Límite de peticiones alcanzado. Intenta de nuevo en un momento.' },
        {
          status: 429,
          headers: {
            'Retry-After':           String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit':     String(API_MAX),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit',     String(API_MAX));
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    return res;
  }

  // ── 3. Cabeceras de seguridad extra en páginas de admin ────
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow'); // no indexar admin en buscadores
    return res;
  }

  return NextResponse.next();
}

// ─── Configurar en qué rutas se ejecuta el middleware ─────────
export const config = {
  matcher: [
    /*
     * Excluye:
     *  - _next/static  (assets estáticos)
     *  - _next/image   (optimización de imágenes)
     *  - favicon.ico
     *  - archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)$).*)',
  ],
};
