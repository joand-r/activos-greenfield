import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerProveedores, crearProveedor } from '@/server/controllers/proveedor.controller';

export const GET = makeRouteHandler(obtenerProveedores);
export const POST = makeRouteHandler(crearProveedor, {
  middlewares: [authenticateToken]
});
