import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createUser, deleteUser, getAll, getById, updateUser } from './service.js';
import { hasRole } from '../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.js';
import { createUserSchema, updateUserSchema } from './schemas.js';
import { AppError } from '../../shared/errors/app-errors.js';

export const userRouter = new Hono();

userRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', createUserSchema),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const user = await createUser(data);
      return c.json({ user }, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

userRouter.get('', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const users = await getAll();
    return c.json({ users }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

userRouter.get('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const user = await getById(id);
    return c.json({ user }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

userRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateUserSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const user = await updateUser(id, data);
      return c.json({ user }, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

userRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const result = await deleteUser(id);
    return c.json({ result }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
