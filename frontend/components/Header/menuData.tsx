import { Menu } from "@/types/menu";

// Menú público (visible para todos)
const menuData: Menu[] = [
  {
    id: 2,
    title: "Lugar",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "Vivienda",
        path: "/lugar/vivienda",
        newTab: false,
      },
      {
        id: 22,
        title: "Almacén",
        path: "/lugar/almacen",
        newTab: false,
      },
      {
        id: 23,
        title: "Oficina",
        path: "/lugar/oficina",
        newTab: false,
      },
    ],
  },
  {
    id: 3,
    title: "Artículo",
    newTab: false,
    submenu: [
      {
        id: 31,
        title: "Buscar Artículo",
        path: "/articulo",
        newTab: false,
      },
    ],
  },
];

// Menú administrativo (solo visible cuando el usuario esté autenticado)
export const adminMenuData: Menu[] = [
  {
    id: 1,
    title: "Inicio",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Artículo",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "Registrar Artículo",
        path: "/admin/articulos/registrar",
        newTab: false,
      },
      {
        id: 22,
        title: "Ver Artículos",
        path: "/admin/articulos/lista",
        newTab: false,
      },
    ],
  },
  {
    id: 3,
    title: "Movimientos",
    newTab: false,
    submenu: [
      {
        id: 31,
        title: "Transferir Activo",
        path: "/admin/detalle/registrar",
        newTab: false,
      },
      {
        id: 32,
        title: "Ver Movimientos",
        path: "/admin/detalle/lista",
        newTab: false,
      },
    ],
  },
  {
    id: 4,
    title: "Administración",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "Categoría",
        newTab: false,
        submenu: [
          {
            id: 410,
            title: "Registrar Categoría",
            path: "/admin/categorias/registrar",
            newTab: false,
          },
          {
            id: 411,
            title: "Ver Categorías",
            path: "/admin/categorias/lista",
            newTab: false,
          },
        ],
      },
      {
        id: 42,
        title: "Lugar",
        newTab: false,
        submenu: [
          {
            id: 421,
            title: "Registrar Lugar",
            path: "/admin/lugares/registrar",
            newTab: false,
          },
          {
            id: 422,
            title: "Ver Lugares",
            path: "/admin/lugares/lista",
            newTab: false,
          },
        ],
      },
      {
        id: 43,
        title: "Marca",
        newTab: false,
        submenu: [
          {
            id: 431,
            title: "Registrar Marca",
            path: "/admin/marcas/registrar",
            newTab: false,
          },
          {
            id: 432,
            title: "Ver Marcas",
            path: "/admin/marcas/lista",
            newTab: false,
          },
        ],
      },
      {
        id: 44,
        title: "Proveedor",
        newTab: false,
        submenu: [
          {
            id: 441,
            title: "Registrar Proveedor",
            path: "/admin/proveedores/registrar",
            newTab: false,
          },
          {
            id: 442,
            title: "Ver Proveedores",
            path: "/admin/proveedores/lista",
            newTab: false,
          },
        ],
      },
    ],
  },
];

export default menuData;
