import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { darDeBajaCelular } from '@/server/controllers/linea.controller';

export const POST = makeRouteHandler(darDeBajaCelular, {
  middlewares: [authenticateToken],
});
