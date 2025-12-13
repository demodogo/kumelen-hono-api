import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { hasRole } from '../../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import { createScheduleSchema, updateScheduleSchema } from './schema.js';
import {
  createSchedule,
  deleteSchedule,
  getAllSchedules,
  getScheduleById,
  getSchedulesByTherapist,
  updateSchedule,
} from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { logger } from '../../../core/logger.js';

export const schedulesRouter = new Hono();

schedulesRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', createScheduleSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      logger.debug({ data }, 'Schedule data received');

      const authed = c.get('user');
      const schedule = await createSchedule(authed.sub, data);
      return c.json(schedule, 201);
    } catch (error) {
      logger.error({ error }, 'Error creating schedule');
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

schedulesRouter.get('', authMiddleware, async (c) => {
  try {
    const includeInactive = c.req.query('includeInactive') === 'true';
    const schedules = await getAllSchedules(includeInactive);
    return c.json(schedules);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

schedulesRouter.get('/by-therapist/:therapistId', authMiddleware, async (c) => {
  try {
    const therapistId = c.req.param('therapistId');
    const includeInactive = c.req.query('includeInactive') === 'true';
    const schedules = await getSchedulesByTherapist(therapistId, includeInactive);
    return c.json(schedules);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

schedulesRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const schedule = await getScheduleById(id);
    return c.json(schedule, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

schedulesRouter.patch(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateScheduleSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const authed = c.get('user');
      const schedules = await updateSchedule(authed.sub, data);
      return c.json(schedules, 200);
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

schedulesRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    const result = await deleteSchedule(authed.sub, id);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
