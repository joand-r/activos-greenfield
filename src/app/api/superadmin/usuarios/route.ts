import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { obtenerUsuarios, crearUsuario } from '@/server/controllers/superadmin';

export const GET = makeRouteHandler(obtenerUsuarios, {
  middlewares: [authenticateToken, verifySuperAdmin]
});

export const POST = makeRouteHandler(crearUsuario, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
