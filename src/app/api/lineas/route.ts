import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerLineas, crearLinea } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerLineas);
export const POST = makeRouteHandler(crearLinea, {
  middlewares: [authenticateToken],
});
