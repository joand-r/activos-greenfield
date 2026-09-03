import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { transferirLinea } from '@/server/controllers/linea.controller';

export const POST = makeRouteHandler(transferirLinea, {
  middlewares: [authenticateToken],
});
