import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerTelefonias, crearTelefonia } from '@/server/controllers/telefonia.controller';

export const GET = makeRouteHandler(obtenerTelefonias);
export const POST = makeRouteHandler(crearTelefonia, {
  middlewares: [authenticateToken],
});
