import { makeRouteHandler } from '@/server/utils/compat';
import { authenticateToken } from '@/server/middleware/auth.middleware';
import { obtenerCelularesLineas } from '@/server/controllers/linea.controller';

export const GET = makeRouteHandler(obtenerCelularesLineas);
