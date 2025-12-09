import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../middleware/role-guard.js';
import { getAllLogs, getUserLogs } from './service.js';
import { AppError } from '../../shared/errors/app-errors.js';

export const logsRouter = new Hono();

logsRouter.get('', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const logs = await getAllLogs();
    return c.json({ logs }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
logsRouter.get('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const logs = await getUserLogs(id);
    return c.json({ logs }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
