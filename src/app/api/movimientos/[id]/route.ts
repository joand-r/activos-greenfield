import { makeRouteHandler } from '@/server/utils/compat';
import { obtenerMovimientoPorId } from '@/server/controllers/movimiento.controller';

export const GET = makeRouteHandler(obtenerMovimientoPorId);
