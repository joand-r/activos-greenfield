import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerProximoCodigo } from '@/server/controllers/activo.controller';

export const GET = makeRouteHandler(obtenerProximoCodigo, {
  middlewares: [authenticateToken]
});
