import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerActivoPorId, actualizarActivo, eliminarActivo } from '@/server/controllers/activo.controller';

export const GET = makeRouteHandler(obtenerActivoPorId);
export const PUT = makeRouteHandler(actualizarActivo, {
  middlewares: [authenticateToken]
});
export const DELETE = makeRouteHandler(eliminarActivo, {
  middlewares: [authenticateToken]
});
