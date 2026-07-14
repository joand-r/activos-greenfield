import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken, verifySuperAdmin } from '@/server/middleware/auth.middleware';
import { actualizarUsuario, eliminarUsuario } from '@/server/controllers/superadmin';

export const PUT = makeRouteHandler(actualizarUsuario, {
  middlewares: [authenticateToken, verifySuperAdmin]
});

export const DELETE = makeRouteHandler(eliminarUsuario, {
  middlewares: [authenticateToken, verifySuperAdmin]
});
