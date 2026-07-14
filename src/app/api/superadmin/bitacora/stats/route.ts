import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerBitacoraStats } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerBitacoraStats, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
