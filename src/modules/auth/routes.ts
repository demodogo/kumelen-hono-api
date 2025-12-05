import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { changePasswordSchema, loginSchema } from './schemas.js';
import { changePassword, loginUser } from './service.js';
import { AuthError } from './errors.js';
import { authMiddleware } from '../../middleware/auth.js';

export const authRouter = new Hono();

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const data = c.req.valid('json');
  try {
    const result = await loginUser(data);
    return c.json({ result }, 200);
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ message: error.message, code: error.code }, error.status as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

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
      if (error instanceof AuthError) {
        return c.json({ message: error.message, code: error.code }, error.status as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
