"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData, { adminMenuData } from "./menuData";
import { useAuth } from "@/contexts/AuthContext";
import { lugarService } from "@/services/lugar.service";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Lugares dinámicos
  const [lugares, setLugares] = useState<any[]>([]);
  
  useEffect(() => {
    cargarLugares();
  }, []);
  
  const cargarLugares = async () => {
    try {
      const data = await lugarService.getAll();
      setLugares(data);
    } catch (error) {
      console.error("Error al cargar lugares:", error);
    }
  };
  
  // Agrupar lugares por tipo
  const lugaresPorTipo = lugares.reduce((acc: any, lugar: any) => {
    if (!acc[lugar.tipo]) {
      acc[lugar.tipo] = [];
    }
    acc[lugar.tipo].push(lugar);
    return acc;
  }, {});
  
  // Seleccionar el menú según si está autenticado
  const currentMenu = isAuthenticated ? adminMenuData : menuData;
  
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const [openSubIndex, setOpenSubIndex] = useState(-1);
  
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
      setOpenSubIndex(-1);
    } else {
      setOpenIndex(index);
      setOpenSubIndex(-1);
    }
  };

  const handleNestedSubmenu = (index) => {
    if (openSubIndex === index) {
      setOpenSubIndex(-1);
    } else {
      setOpenSubIndex(index);
    }
  };

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-40 max-w-full px-4 xl:mr-12">
              <Link
                href="/"
                className={`header-logo block ${
                  sticky ? "py-5 lg:py-2" : "py-8"
                } `}
              >
                <Image
                  src="/images/logo/greenfield-negro.png"
                  alt="Activos Greenfield"
                  width={70}
                  height={70}
                  className="dark:hidden"
                  style={{ height: 'auto' }}
                />
                <Image
                  src="/images/logo/greenfield-blanco.png"
                  alt="Activos Greenfield"
                  width={70}
                  height={70}
                  className="hidden dark:block"
                  style={{ height: 'auto' }}
                />
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0 " : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[-8px] -rotate-45" : " "
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-12">
                    {currentMenu.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                              usePathName === menuItem.path
                                ? "text-primary dark:text-white"
                                : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="25" height="24" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {/* Si es el menú de Lugar y no está autenticado, mostrar lugares dinámicos */}
                              {menuItem.title === "Lugar" && !isAuthenticated ? (
                                <>
                                  {['Vivienda', 'Almacén', 'Oficina'].map((tipoNombre, tipoIdx) => {
                                    const tipoKey = tipoNombre.toLowerCase().replace('é', 'e');
                                    const lugaresDelTipo = lugaresPorTipo[tipoNombre] || [];
                                    
                                    if (lugaresDelTipo.length === 0) return null;
                                    
                                    return (
                                      <div key={tipoIdx} className="mb-3 last:mb-0">
                                        <p className="mb-2 px-3 text-xs font-bold uppercase text-body-color dark:text-white/50">
                                          {tipoNombre}
                                        </p>
                                        {lugaresDelTipo.map((lugar: any) => (
                                          <Link
                                            key={lugar.id}
                                            href={`/lugar/${tipoKey}?id=${lugar.id}`}
                                            className="block rounded py-2 text-sm text-dark hover:bg-primary/5 hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                                          >
                                            {lugar.nombre}
                                          </Link>
                                        ))}
                                      </div>
                                    );
                                  })}
                                  {Object.keys(lugaresPorTipo).length === 0 && (
                                    <p className="px-3 py-2 text-sm text-body-color dark:text-white/50">
                                      No hay lugares registrados
                                    </p>
                                  )}
                                </>
                              ) : (
                                /* Menú normal */
                                <>
                                  {menuItem.submenu.map((submenuItem, subIndex) => (
                                    <div key={subIndex}>
                                      {submenuItem.path ? (
                                        <Link
                                          href={submenuItem.path}
                                          className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                                        >
                                          {submenuItem.title}
                                        </Link>
                                      ) : (
                                      <>
                                        <p
                                          onClick={() => handleNestedSubmenu(subIndex)}
                                        className="flex cursor-pointer items-center justify-between rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                                      >
                                        {submenuItem.title}
                                        <span className="pl-2">
                                          <svg width="20" height="20" viewBox="0 0 25 24">
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                              fill="currentColor"
                                            />
                                          </svg>
                                        </span>
                                      </p>
                                      {submenuItem.submenu && (
                                        <div
                                          className={`ml-4 ${
                                            openSubIndex === subIndex ? "block" : "hidden"
                                          }`}
                                        >
                                          {submenuItem.submenu.map((nestedItem, nestedIndex) => (
                                            <Link
                                              href={nestedItem.path}
                                              key={nestedIndex}
                                              className="block rounded py-2 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                                            >
                                              {nestedItem.title}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                              </>
                              )}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end gap-4 pr-16 lg:pr-0">
                {isAuthenticated ? (
                  <>
                    <div className="hidden md:block text-sm">
                      <p className="text-dark dark:text-white font-medium">
                        {user?.nombre}
                      </p>
                      <p className="text-body-color dark:text-body-color-dark text-xs">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="ease-in-up shadow-btn hover:shadow-btn-hover hidden rounded-sm bg-red-600 px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-red-700 md:block md:px-9 lg:px-6 xl:px-9"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="ease-in-up shadow-btn hover:shadow-btn-hover hidden rounded-sm bg-primary px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-opacity-90 md:block md:px-9 lg:px-6 xl:px-9"
                  >
                    Iniciar Sesión
                  </Link>
                )}
                <div>
                  <ThemeToggler />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
