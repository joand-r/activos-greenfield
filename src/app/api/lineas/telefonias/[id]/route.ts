import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { actualizarTelefonia, eliminarTelefonia } from '@/server/controllers/telefonia.controller';

export const PUT = makeRouteHandler(actualizarTelefonia, {
  middlewares: [authenticateToken],
});
export const DELETE = makeRouteHandler(eliminarTelefonia, {
  middlewares: [authenticateToken],
});
