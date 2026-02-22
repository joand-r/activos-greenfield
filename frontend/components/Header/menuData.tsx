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
    title: "Activos",
    newTab: false,
    submenu: [
      {
        id: 31,
        title: "Lista de Activos",
        path: "/admin/activos/lista",
        newTab: false,
      },
      {
        id: 32,
        title: "Registrar Activo",
        path: "/admin/activos/registrar",
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
    id: 4,
    title: "Administración",
    newTab: false,
    submenu: [
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
  {
    id: 2,
    title: "Activos",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "Lista de Tipos de Activos",
        path: "/admin/activos/lista",
        newTab: false,
      },
      {
        id: 22,
        title: "Registrar Activo",
        path: "/admin/activos/registrar",
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
        title: "Registrar Movimiento",
        path: "/admin/movimientos/registrar",
        newTab: false,
      },
      {
        id: 32,
        title: "Ver Movimientos",
        path: "/admin/movimientos/lista",
        newTab: false,
      },
    ],
  },
];

export default menuData;
