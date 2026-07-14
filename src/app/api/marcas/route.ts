import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerMarcas, crearMarca } from '@/server/controllers/marca.controller';

export const GET = makeRouteHandler(obtenerMarcas);
export const POST = makeRouteHandler(crearMarca, {
  middlewares: [authenticateToken]
});
