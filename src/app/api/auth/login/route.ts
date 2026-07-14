import { makeRouteHandler } from '@/server/utils/compat';
import { login } from '@/server/controllers/auth.controller';

export const POST = makeRouteHandler(login);
