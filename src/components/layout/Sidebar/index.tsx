"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { activoService, Activo } from "@/services/activo.service";
import ThemeToggler from "../Header/ThemeToggler";

type DockPosition = "left" | "right" | "bottom" | "top";

interface SidebarSubItem {
  title: string;
  path: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path?: string; // Direct link
  subItems?: SidebarSubItem[]; // Accordion submenu
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export default function Sidebar() {
  const { user, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [dockPosition, setDockPosition] = useState<DockPosition>("left");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    modules: { title: string; path: string }[];
    activos: Activo[];
  }>({ modules: [], activos: [] });

  // Control de menús colapsables
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Control de menú emergente horizontal (Top/Bottom)
  const [activeHorizontalMenu, setActiveHorizontalMenu] = useState<string | null>(null);

  // Estados de arrastre (Drag-to-Dock)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeZone, setActiveZone] = useState<DockPosition | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Cargar configuración local
  useEffect(() => {
    const savedPosition = localStorage.getItem("sidebar_position") as DockPosition;
    if (savedPosition && ["left", "right", "bottom", "top"].includes(savedPosition)) {
      setDockPosition(savedPosition);
    }
    const savedCollapsed = localStorage.getItem("sidebar_collapsed") === "true";
    setCollapsed(savedCollapsed);
  }, []);

  // Ajustar el espaciado (padding) del contenedor principal adyacente según la posición
  useEffect(() => {
    const adjustSpacing = () => {
      const sibling = sidebarRef.current?.nextElementSibling as HTMLElement;
      if (sibling) {
        sibling.style.paddingLeft = "";
        sibling.style.paddingRight = "";
        sibling.style.paddingTop = "";
        sibling.style.paddingBottom = "";

        if (dockPosition === "left") {
          sibling.style.paddingLeft = collapsed ? "64px" : "240px";
        } else if (dockPosition === "right") {
          sibling.style.paddingRight = collapsed ? "64px" : "240px";
        } else if (dockPosition === "top") {
          sibling.style.paddingTop = "64px";
        } else if (dockPosition === "bottom") {
          sibling.style.paddingBottom = "64px";
        }
      }
    };

    const timeoutId = setTimeout(adjustSpacing, 100);

    window.addEventListener("resize", adjustSpacing);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", adjustSpacing);
      const sibling = sidebarRef.current?.nextElementSibling as HTMLElement;
      if (sibling) {
        sibling.style.paddingLeft = "";
        sibling.style.paddingRight = "";
        sibling.style.paddingTop = "";
        sibling.style.paddingBottom = "";
      }
    };
  }, [dockPosition, collapsed]);

  // Cerrar sub-menús horizontales al hacer clic afuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActiveHorizontalMenu(null);
      }
    };
    if (activeHorizontalMenu) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [activeHorizontalMenu]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  const toggleDropdown = (title: string) => {
    if (collapsed) {
      setCollapsed(false);
      localStorage.setItem("sidebar_collapsed", "false");
    }
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Definición de Estructura de Módulos Colapsables
  const sidebarItems: SidebarItem[] = [
    {
      title: "Inicio",
      path: "/",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "Activos",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      adminOnly: true,
      subItems: [
        { title: "Ver Activos", path: "/admin/activos/lista" },
        { title: "Registrar Activo", path: "/admin/activos/registrar" },
      ],
    },
    {
      title: "Movimientos",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      adminOnly: true,
      subItems: [
        { title: "Ver Movimientos", path: "/admin/movimientos/lista" },
        { title: "Registrar Movimiento", path: "/admin/movimientos/registrar" },
      ],
    },
    {
      title: "Administración",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      adminOnly: true,
      subItems: [
        { title: "Lugares", path: "/admin/lugares/lista" },
        { title: "Marcas", path: "/admin/marcas/lista" },
        { title: "Proveedores", path: "/admin/proveedores/lista" },
      ],
    },
    {
      title: "Seguridad y Usuarios",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      superAdminOnly: true,
      subItems: [
        { title: "Bitácora", path: "/admin/superadmin/bitacora" },
        { title: "Backups", path: "/admin/superadmin/backups" },
        { title: "Usuarios", path: "/admin/superadmin/usuarios" },
      ],
    },
  ];

  // Filtrar módulos permitidos según rol
  const filteredItems = sidebarItems.filter((item) => {
    if (!isAuthenticated) {
      return item.title === "Inicio";
    }
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && user?.rol !== "Administrador" && user?.rol !== "Operadora") return false;
    return true;
  });

  // Manejador de búsqueda
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim().length < 2) {
        setSearchResults({ modules: [], activos: [] });
        return;
      }

      // 1. Filtrar en módulos y sub-módulos (solo si está autenticado)
      const matchedModules: { title: string; path: string }[] = [];
      if (isAuthenticated) {
        filteredItems.forEach((item) => {
          if (item.path && item.title.toLowerCase().includes(query.toLowerCase())) {
            matchedModules.push({ title: item.title, path: item.path });
          }
          if (item.subItems) {
            item.subItems.forEach((sub) => {
              if (sub.title.toLowerCase().includes(query.toLowerCase())) {
                matchedModules.push({ title: `${item.title} > ${sub.title}`, path: sub.path });
              }
            });
          }
        });
      }

      // 2. Buscar en la base de datos de activos (buscador universal)
      try {
        const activosData = await activoService.getAll();
        const matchedActivos = (activosData || []).filter(
          (act: Activo) =>
            act.nombre?.toLowerCase().includes(query.toLowerCase()) ||
            act.codigo?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults({ modules: matchedModules, activos: matchedActivos.slice(0, 5) });
      } catch (err) {
        console.error("Error al buscar activos en sidebar:", err);
        setSearchResults({ modules: matchedModules, activos: [] });
      }
    },
    [filteredItems, isAuthenticated]
  );

  // drag-to-dock drag events
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setGhostPosition({ x: rect.left, y: rect.top });
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setGhostPosition({ x: rect.left, y: rect.top });
    }
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setGhostPosition({ x, y });

      const w = window.innerWidth;
      const h = window.innerHeight;

      const cursorX = e.clientX;
      const cursorY = e.clientY;

      const distLeft = cursorX;
      const distRight = w - cursorX;
      const distTop = cursorY;
      const distBottom = h - cursorY;

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      if (minDist < 180) {
        if (minDist === distLeft) {
          setActiveZone("left");
        } else if (minDist === distRight) {
          setActiveZone("right");
        } else if (minDist === distTop) {
          setActiveZone("top");
        } else {
          setActiveZone("bottom");
        }
      } else {
        setActiveZone(null);
      }
    },
    [isDragging, dragOffset]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const x = touch.clientX - dragOffset.x;
      const y = touch.clientY - dragOffset.y;
      setGhostPosition({ x, y });

      const w = window.innerWidth;
      const h = window.innerHeight;

      const cursorX = touch.clientX;
      const cursorY = touch.clientY;

      const distLeft = cursorX;
      const distRight = w - cursorX;
      const distTop = cursorY;
      const distBottom = h - cursorY;

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      if (minDist < 180) {
        if (minDist === distLeft) {
          setActiveZone("left");
        } else if (minDist === distRight) {
          setActiveZone("right");
        } else if (minDist === distTop) {
          setActiveZone("top");
        } else {
          setActiveZone("bottom");
        }
      } else {
        setActiveZone(null);
      }
    },
    [isDragging, dragOffset]
  );

  const onMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setGhostPosition(null);

    if (activeZone) {
      setDockPosition(activeZone);
      localStorage.setItem("sidebar_position", activeZone);
    }
    setActiveZone(null);
  }, [isDragging, activeZone]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setGhostPosition(null);

    if (activeZone) {
      setDockPosition(activeZone);
      localStorage.setItem("sidebar_position", activeZone);
    }
    setActiveZone(null);
  }, [isDragging, activeZone]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const isHorizontal = dockPosition === "bottom" || dockPosition === "top";

  // Usar borde transparente súper sutil en lugar de la línea blanca sólida
  const positionClasses = {
    left: `fixed left-0 top-0 h-screen border-r ${
      collapsed ? "w-16" : "w-60"
    } z-[999] bg-white/95 dark:bg-black/95 backdrop-blur-md border-black/5 dark:border-white/5 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`,
    right: `fixed right-0 top-0 h-screen border-l ${
      collapsed ? "w-16" : "w-60"
    } z-[999] bg-white/95 dark:bg-black/95 backdrop-blur-md border-black/5 dark:border-white/5 transition-all duration-300 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]`,
    bottom:
      "fixed bottom-0 left-0 w-full h-16 border-t z-[999] bg-white/95 dark:bg-black/95 backdrop-blur-md border-black/5 dark:border-white/5 transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]",
    top:
      "fixed top-0 left-0 w-full h-16 border-b z-[999] bg-white/95 dark:bg-black/95 backdrop-blur-md border-black/5 dark:border-white/5 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
  };

  return (
    <>
      {/* ─── Zonas de Docking Previsualización ─── */}
      {isDragging && activeZone === "left" && (
        <div className="fixed left-0 top-0 h-screen w-60 bg-primary/10 border-r-4 border-dashed border-primary z-[9999] backdrop-blur-xs transition-all animate-pulse" />
      )}
      {isDragging && activeZone === "right" && (
        <div className="fixed right-0 top-0 h-screen w-60 bg-primary/10 border-l-4 border-dashed border-primary z-[9999] backdrop-blur-xs transition-all animate-pulse" />
      )}
      {isDragging && activeZone === "top" && (
        <div className="fixed top-0 left-0 w-full h-16 bg-primary/10 border-b-4 border-dashed border-primary z-[9999] backdrop-blur-xs transition-all animate-pulse" />
      )}
      {isDragging && activeZone === "bottom" && (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-primary/10 border-t-4 border-dashed border-primary z-[9999] backdrop-blur-xs transition-all animate-pulse" />
      )}

      {/* ─── Fantasma Flotante al Arrastrar ─── */}
      {isDragging && ghostPosition && (
        <div
          style={{
            left: ghostPosition.x,
            top: ghostPosition.y,
            width: isHorizontal ? "100%" : collapsed ? 64 : 240,
            height: isHorizontal ? 64 : "100%",
          }}
          className="fixed pointer-events-none opacity-50 z-[9999] bg-primary/5 border-2 border-primary rounded-lg shadow-2xl backdrop-blur-xs"
        />
      )}

      {/* ─── Sidebar Real ─── */}
      <div
        ref={sidebarRef}
        className={`${positionClasses[dockPosition]} flex ${
          isHorizontal ? "flex-row items-center px-6 justify-between" : "flex-col py-6"
        } select-none no-scrollbar`}
      >
        {/* ─── MAQUETACIÓN HORIZONTAL (Top / Bottom) ─── */}
        {isHorizontal ? (
          <>
            {/* Logo de Imagen */}
            <div className="flex items-center gap-2 flex-shrink-0">
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

            {/* Tirador de Arrastre Mover */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="flex items-center gap-1.5 cursor-move px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50/20 hover:bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/40 text-body-color dark:text-gray-400 transition-colors text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 ml-2 shadow-xs"
              title="Arrastra desde aquí para mover el Sidebar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="hidden sm:inline">Mover</span>
            </div>

            {/* Listado de Enlaces Horizontal (Cambiado a overflow-visible para ver desplegables) */}
            <div className="flex-grow flex items-center justify-center gap-2 overflow-visible mx-4">
              {filteredItems.map((item) => {
                const hasSubItems = !!item.subItems;
                const isPopupOpen = activeHorizontalMenu === item.title;
                const isActive = item.path ? pathname === item.path : false;

                if (hasSubItems) {
                  return (
                    <div key={item.title} className="relative overflow-visible">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHorizontalMenu((prev) => (prev === item.title ? null : item.title));
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs whitespace-nowrap ${
                          isPopupOpen
                            ? "bg-primary/10 text-primary dark:text-white font-bold"
                            : "text-body-color dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        <div>{item.icon}</div>
                        <span className="font-semibold">{item.title}</span>
                        <svg className={`h-3 w-3 transition-transform ${isPopupOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Popup subitems con Glassmorphism y z-index máximo */}
                      {isPopupOpen && (
                        <div
                          ref={popupRef}
                          className={`absolute ${dockPosition === "top" ? "top-full mt-2" : "bottom-full mb-2"} left-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-xl shadow-2xl py-2 px-1.5 min-w-48 z-[9999] flex flex-col gap-0.5 animate-fadeIn`}
                        >
                          {item.subItems?.map((sub) => {
                            const isSubActive = pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                href={sub.path}
                                onClick={() => setActiveHorizontalMenu(null)}
                                className={`block px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                                  isSubActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-body-color dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                }`}
                              >
                                {sub.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    href={item.path!}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                        : "text-body-color dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <div>{item.icon}</div>
                    <span className="font-semibold">{item.title}</span>
                  </Link>
                );
              })}
            </div>

            {/* Buscador Horizontal Compacto */}
            <div className="relative w-44 flex-shrink-0 hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar..."
                className="sidebar-search w-full text-[11px] rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 pr-3 text-body-color outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(74,108,247,0.15)] transition-all"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body-color/75 dark:text-white/75">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {/* Resultados de búsqueda */}
              {searchQuery.trim().length >= 2 && (
                <div className={`absolute right-0 ${dockPosition === "top" ? "top-full mt-2" : "bottom-full mb-2"} w-64 bg-white/95 dark:bg-black/95 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-xl shadow-2xl z-[9999] max-h-56 overflow-y-auto px-1.5 py-2 text-xs flex flex-col gap-0.5`}>
                  {searchResults.activos.map((act) => (
                    <Link
                      key={act.id}
                      href={isAuthenticated ? `/admin/activos/lista?codigo=${act.codigo}` : `/?codigo=${act.codigo}`}
                      onClick={() => setSearchQuery("")}
                      className="flex flex-col p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-semibold text-black dark:text-white text-[11px]">{act.nombre}</span>
                      <span className="text-[9px] text-body-color">{act.codigo}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Horizontal (Usuario/Invitado y Tema) */}
            <div className="flex items-center gap-3 ml-4 border-l border-black/5 dark:border-white/5 pl-4 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <div className="text-right hidden lg:block leading-tight">
                    <p className="text-[10px] font-bold text-black dark:text-white truncate max-w-28">{user?.nombre}</p>
                    <p className="text-[8px] text-body-color dark:text-gray-400 truncate max-w-28">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="scale-80 origin-right">
                      <ThemeToggler />
                    </div>
                    <Link
                      href="/logout"
                      aria-label="Cerrar Sesión"
                      className="flex items-center justify-center rounded-full cursor-pointer bg-red-50/80 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 hover:text-red-650 transition-all h-8 w-8"
                      title="Cerrar Sesión"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-right hidden lg:block leading-tight">
                    <p className="text-[10px] font-bold text-black dark:text-white">Invitado</p>
                  </div>
                  <Link
                    href="/signin"
                    className="flex items-center justify-center px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-semibold hover:bg-primary/90 transition shadow-sm"
                  >
                    Acceder
                  </Link>
                  <div className="scale-80 origin-right">
                    <ThemeToggler />
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* ─── MAQUETACIÓN VERTICAL (Left / Right) ─── */
          <>
            {/* Header con Imagen de Logo */}
            <div className={`flex ${collapsed ? "flex-col gap-3 items-center justify-center" : "items-center justify-between"} px-4 mb-8`}>
              <div className="flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/logo/greenfield-negro.png"
                  alt="Logo"
                  width={collapsed ? 42 : 56}
                  height={collapsed ? 42 : 56}
                  className="dark:hidden"
                  style={{ height: "auto" }}
                />
                <Image
                  src="/images/logo/greenfield-blanco.png"
                  alt="Logo"
                  width={collapsed ? 42 : 56}
                  height={collapsed ? 42 : 56}
                  className="hidden dark:block"
                  style={{ height: "auto" }}
                />
              </div>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-body-color dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {collapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                  )}
                </svg>
              </button>
            </div>

            {/* Buscador Universal */}
            {!collapsed && (
              <div className="px-3 mb-4 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="sidebar-search w-full text-[11px] rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 pr-3 text-body-color outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(74,108,247,0.15)] transition-all"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body-color/75 dark:text-white/75">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>

                {/* Panel de Resultados del Buscador */}
                {searchQuery.trim().length >= 2 && (
                  <div className="absolute left-4 right-4 mt-2 bg-white dark:bg-dark border border-black/5 dark:border-white/5 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto px-2 py-3 text-xs">
                    {searchResults.modules.length === 0 && searchResults.activos.length === 0 && (
                      <p className="text-center text-body-color py-3">No se encontraron resultados</p>
                    )}

                    {searchResults.modules.length > 0 && (
                      <div className="mb-2">
                        <p className="font-bold text-primary px-2 mb-1.5 uppercase tracking-wider text-[10px]">Módulos</p>
                        {searchResults.modules.map((mod) => (
                          <Link
                            key={mod.path}
                            href={mod.path}
                            onClick={() => setSearchQuery("")}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors"
                          >
                            <span>{mod.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.activos.length > 0 && (
                      <div>
                        <p className="font-bold text-primary px-2 mb-1.5 uppercase tracking-wider text-[10px]">Activos</p>
                        {searchResults.activos.map((act) => (
                          <Link
                            key={act.id}
                            href={isAuthenticated ? `/admin/activos/lista?codigo=${act.codigo}` : `/?codigo=${act.codigo}`}
                            onClick={() => setSearchQuery("")}
                            className="flex flex-col p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="font-semibold text-black dark:text-white text-xs">{act.nombre}</span>
                            <span className="text-[10px] text-body-color">{act.codigo} - {act.tipo_activo}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Listado de Enlaces Vertical */}
            <div className="flex-grow overflow-y-auto px-4 space-y-1 no-scrollbar">
              {filteredItems.map((item) => {
                const hasSubItems = !!item.subItems;
                const isDropdownOpen = !!openDropdowns[item.title];
                const isActive = item.path ? pathname === item.path : false;

                if (hasSubItems) {
                  return (
                    <div key={item.title} className="space-y-1">
                      {/* Cabecera del Acordeón */}
                      <button
                        onClick={() => toggleDropdown(item.title)}
                        className={`flex w-full items-center justify-between px-3 py-2 rounded-xl transition-all text-body-color dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-900/40 hover:text-black dark:hover:text-white`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`flex-shrink-0 text-current transition-transform duration-300 ${collapsed ? "scale-120" : ""}`}>{item.icon}</div>
                          {!collapsed && <span className="text-xs font-semibold">{item.title}</span>}
                        </div>
                        {!collapsed && (
                          <svg
                            className={`h-3 w-3 transition-transform duration-200 ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {/* Sub-elementos desplegables con diseño premium de línea de conexión */}
                      {isDropdownOpen && !collapsed && (
                        <div className="pl-6 space-y-0.5 animate-fadeIn">
                          {item.subItems?.map((sub) => {
                            const isSubActive = pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                href={sub.path}
                                className={`block px-3 py-1.5 text-[11px] font-medium border-l border-black/5 dark:border-white/5 transition-all duration-300 ${
                                  isSubActive
                                    ? "text-primary dark:text-white font-bold border-l-2 border-primary pl-4"
                                    : "text-body-color dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-900/25 pl-3.5"
                                }`}
                              >
                                {sub.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Enlace directo - Modificado para usar dark:text-white para alto contraste
                return (
                  <Link
                    key={item.path}
                    href={item.path!}
                    className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent text-primary dark:text-white font-bold border-l-4 border-primary"
                        : "text-body-color dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-900/40 hover:text-black dark:hover:text-white border-l-4 border-transparent"
                    }`}
                  >
                    <div className={`flex-shrink-0 transition-transform duration-300 ${collapsed ? "scale-120" : ""}`}>{item.icon}</div>
                    {!collapsed && <span className="text-xs font-semibold">{item.title}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Tirador de Arrastre Mover */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="mx-3 my-2.5 flex items-center justify-center gap-2 cursor-move py-2 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-gray-50/20 hover:bg-gray-50 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 text-body-color dark:text-gray-400 transition-all duration-300 flex-shrink-0 shadow-xs"
              title="Arrastra desde aquí para mover el Sidebar (Izquierda/Derecha)"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {!collapsed && <span className="text-[10px] font-extrabold uppercase tracking-wider">Mover</span>}
            </div>

            {/* Sidebar Footer Compacto en Fila Única */}
            {isAuthenticated ? (
              !collapsed ? (
                <div className="px-3 pt-2 pb-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2 flex-shrink-0">
                  {/* Fila: avatar + nombre + theme toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                        {user?.nombre?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-black dark:text-white truncate leading-tight">{user?.nombre}</p>
                        <p className="text-[8px] text-body-color dark:text-gray-400 truncate leading-tight">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 scale-90 origin-right">
                      <ThemeToggler />
                    </div>
                  </div>

                  {/* Botón Cerrar Sesión — igual que MOVER */}
                  <Link
                    href="/logout"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all"
                    title="Cerrar Sesión"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Cerrar Sesión</span>
                  </Link>
                </div>
              ) : (
                <div className="py-2 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-3 flex-shrink-0">
                  <Link href="/logout" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-red-500/10 hover:text-red-500 font-bold text-xs transition-colors" title="Cerrar Sesión (Hacer clic para salir)">
                    {user?.nombre?.charAt(0).toUpperCase() || "U"}
                  </Link>
                  <div className="scale-90">
                    <ThemeToggler />
                  </div>
                </div>
              )
            ) : (
              !collapsed ? (
                <div className="px-3 pt-2 pb-1 border-t border-black/5 dark:border-white/5 flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                        V
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-black dark:text-white truncate leading-tight">Invitado</p>
                        <p className="text-[8px] text-body-color dark:text-gray-400 truncate leading-tight">Visita pública</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 scale-90 origin-right">
                      <ThemeToggler />
                    </div>
                  </div>
                  <Link
                    href="/signin"
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-primary text-white rounded-lg text-[10px] font-semibold hover:bg-primary/90 transition shadow-sm"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </Link>
                </div>
              ) : (
                <div className="py-2 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-3 flex-shrink-0">
                  <Link href="/signin" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-sm hover:bg-primary/90 transition" title="Iniciar Sesión">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                  <div className="scale-90">
                    <ThemeToggler />
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}
