import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerActivos, crearActivo } from '@/server/controllers/activo.controller';

export const GET = makeRouteHandler(obtenerActivos);
export const POST = makeRouteHandler(crearActivo, {
  middlewares: [authenticateToken]
});
