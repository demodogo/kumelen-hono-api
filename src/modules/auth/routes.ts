import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { changePasswordSchema } from './schemas.js';
import { changePassword } from './service.js';
import { authMiddleware } from '../../middleware/auth.js';
import { handleError } from '../../utils/errors.js';

export const authRouter = new Hono();

authRouter.patch(
  'change-password/:id',
  authMiddleware,
  zValidator('json', changePasswordSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authedUser = c.get('user');
      if (authedUser.sub !== id) {
        return c.json({ message: 'Forbidden', code: 'FORBIDDEN', status: 403 });
      }
      const result = await changePassword(id, data.password);
      return c.json({ result }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);
