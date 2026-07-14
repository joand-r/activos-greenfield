import { makeRouteHandler } from '@/server/utils/compat';
import { getMe } from '@/server/controllers/auth.controller';
import { authenticateToken } from '@/server/middleware/auth.middleware';

export const GET = makeRouteHandler(getMe, {
  middlewares: [authenticateToken]
});
