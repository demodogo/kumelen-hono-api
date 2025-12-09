import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { hasRole } from '../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import { mediaCreateSchema, presignMediaSchema } from './schemas.js';
import { AppError } from '../../shared/errors/app-errors.js';
import { createMedia, presignUpload } from './service.js';

export const mediaRouter = new Hono();

mediaRouter.post(
  '/presign',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', presignMediaSchema),
  async (c) => {
    try {
      const { fileName, contentType, folder } = c.req.valid('json');
      const result = await presignUpload({ fileName, contentType, folder });
      return c.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

mediaRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', mediaCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const authed = c.get('user');
      const media = await createMedia(authed.sub, data);
      return c.json({ media }, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
