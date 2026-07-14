import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerLugarPorId, actualizarLugar, eliminarLugar } from '@/server/controllers/lugar.controller';

export const GET = makeRouteHandler(obtenerLugarPorId);
export const PUT = makeRouteHandler(actualizarLugar, {
  middlewares: [authenticateToken]
});
export const DELETE = makeRouteHandler(eliminarLugar, {
  middlewares: [authenticateToken]
});
