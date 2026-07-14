import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerRoles } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerRoles, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
