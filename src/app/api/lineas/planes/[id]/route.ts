import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { actualizarPlan, eliminarPlan } from '@/server/controllers/plan.controller';

export const PUT = makeRouteHandler(actualizarPlan, {
  middlewares: [authenticateToken],
});
export const DELETE = makeRouteHandler(eliminarPlan, {
  middlewares: [authenticateToken],
});
