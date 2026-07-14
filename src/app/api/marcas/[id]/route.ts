import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerMarcaPorId, actualizarMarca, eliminarMarca } from '@/server/controllers/marca.controller';

export const GET = makeRouteHandler(obtenerMarcaPorId);
export const PUT = makeRouteHandler(actualizarMarca, {
  middlewares: [authenticateToken]
});
export const DELETE = makeRouteHandler(eliminarMarca, {
  middlewares: [authenticateToken]
});
