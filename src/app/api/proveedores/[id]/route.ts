import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerProveedorPorId, actualizarProveedor, eliminarProveedor } from '@/server/controllers/proveedor.controller';

export const GET = makeRouteHandler(obtenerProveedorPorId);
export const PUT = makeRouteHandler(actualizarProveedor, {
  middlewares: [authenticateToken]
});
export const DELETE = makeRouteHandler(eliminarProveedor, {
  middlewares: [authenticateToken]
});
