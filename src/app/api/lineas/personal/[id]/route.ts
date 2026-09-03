import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerPersonalPorId, actualizarPersonal, eliminarPersonal } from '@/server/controllers/personal.controller';

export const GET = makeRouteHandler(obtenerPersonalPorId);
export const PUT = makeRouteHandler(actualizarPersonal, {
  middlewares: [authenticateToken],
});
export const DELETE = makeRouteHandler(eliminarPersonal, {
  middlewares: [authenticateToken],
});
