import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerBitacoraTablas } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerBitacoraTablas, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
