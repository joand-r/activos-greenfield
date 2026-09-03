import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerLineaPorId, actualizarLinea, eliminarLinea } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerLineaPorId);
export const PUT = makeRouteHandler(actualizarLinea, {
  middlewares: [authenticateToken],
});
export const DELETE = makeRouteHandler(eliminarLinea, {
  middlewares: [authenticateToken],
});
