import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerBackupsInfo } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerBackupsInfo, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
