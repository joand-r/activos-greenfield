import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerBitacora } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerBitacora, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
