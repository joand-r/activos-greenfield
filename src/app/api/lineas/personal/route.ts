import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerPersonal, crearPersonal } from '@/server/controllers/personal.controller';

export const GET = makeRouteHandler(obtenerPersonal);
export const POST = makeRouteHandler(crearPersonal, {
  middlewares: [authenticateToken],
});
