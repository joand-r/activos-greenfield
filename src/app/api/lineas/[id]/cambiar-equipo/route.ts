import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { cambiarEquipoLinea } from '@/server/controllers/linea.controller';

export const POST = makeRouteHandler(cambiarEquipoLinea, {
  middlewares: [authenticateToken],
});
