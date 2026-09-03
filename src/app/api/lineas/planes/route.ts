import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerPlanes, crearPlan } from '@/server/controllers/plan.controller';

export const GET = makeRouteHandler(obtenerPlanes);
export const POST = makeRouteHandler(crearPlan, {
  middlewares: [authenticateToken],
});
