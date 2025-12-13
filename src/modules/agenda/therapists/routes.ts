import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { hasRole } from '../../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import { assignServicesSchema, createTherapistSchema, updateTherapistSchema } from './schemas.js';
import {
  assignServicesToTherapist,
  createTherapist,
  deleteTherapist,
  getAllTherapists,
  getTherapistById,
  getTherapistsByService,
  updateTherapist,
} from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { logger } from '../../../core/logger.js';

export const therapistsRouter = new Hono();

therapistsRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', createTherapistSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      logger.debug({ data }, 'Therapist data received');

      const authed = c.get('user');
      const therapist = await createTherapist(authed.sub, data);
      return c.json(therapist, 201);
    } catch (error) {
      logger.error({ error }, 'Error creating therapist');
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

therapistsRouter.get('', authMiddleware, async (c) => {
  try {
    const includeInactive = c.req.query('includeInactive') === 'true';
    const therapists = await getAllTherapists(includeInactive);
    return c.json(therapists);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

therapistsRouter.get('/by-service/:serviceId', authMiddleware, async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const therapists = await getTherapistsByService(serviceId);
    return c.json(therapists);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

therapistsRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const therapist = await getTherapistById(id);
    return c.json(therapist, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

therapistsRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateTherapistSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const therapist = await updateTherapist(authed.sub, id, data);
      return c.json(therapist, 200);
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

therapistsRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteTherapist(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

therapistsRouter.post(
  '/:id/services',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', assignServicesSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const therapist = await assignServicesToTherapist(authed.sub, id, data);
      return c.json(therapist, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
