import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerLugares, crearLugar } from '@/server/controllers/lugar.controller';

export const GET = makeRouteHandler(obtenerLugares);
export const POST = makeRouteHandler(crearLugar, {
  middlewares: [authenticateToken]
});
