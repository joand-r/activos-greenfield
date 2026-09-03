import { makeRouteHandler } from '@/server/utils/compat';
import { obtenerHistorialLinea } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerHistorialLinea);
