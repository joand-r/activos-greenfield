import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerCelularPorId, actualizarEstadoCelular } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerCelularPorId);
export const PUT = makeRouteHandler(actualizarEstadoCelular, {
  middlewares: [authenticateToken],
});
