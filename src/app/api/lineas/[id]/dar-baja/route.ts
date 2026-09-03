import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { darDeBajaLinea } from '@/server/controllers/linea.controller';

export const POST = makeRouteHandler(darDeBajaLinea, {
  middlewares: [authenticateToken],
});
