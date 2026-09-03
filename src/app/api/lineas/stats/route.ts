import { makeRouteHandler } from '@/server/utils/compat';
import { obtenerEstadisticas } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerEstadisticas);
