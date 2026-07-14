import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerMovimientos, crearMovimiento } from '@/server/controllers/movimiento.controller';

export const GET = makeRouteHandler(obtenerMovimientos);
export const POST = makeRouteHandler(crearMovimiento, {
  middlewares: [authenticateToken]
});
