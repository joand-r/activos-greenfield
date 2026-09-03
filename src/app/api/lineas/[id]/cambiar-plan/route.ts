import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { cambiarPlanLinea } from '@/server/controllers/linea.controller';

export const POST = makeRouteHandler(cambiarPlanLinea, {
  middlewares: [authenticateToken],
});
