import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../middleware/role-guard.js';
import { getAllLogs, getUserLogs } from './service.js';
import { handleError } from '../../utils/errors.js';

export const logsRouter = new Hono();

logsRouter.get('', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const logs = await getAllLogs();
    return c.json({ logs }, 200);
  } catch (error) {
    return handleError(error, c);
  }
});
logsRouter.get('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const logs = await getUserLogs(id);
    return c.json({ logs }, 200);
  } catch (error) {
    return handleError(error, c);
  }
});
