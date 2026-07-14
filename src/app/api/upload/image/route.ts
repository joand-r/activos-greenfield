import { makeRouteHandler } from '@/server/utils/compat';
import { uploadImageController } from '@/server/controllers/upload.controller';

export const POST = makeRouteHandler(uploadImageController);
