import { makeRouteHandler } from '@/server/utils/compat';
import { register } from '@/server/controllers/auth.controller';

export const POST = makeRouteHandler(register);
