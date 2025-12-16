import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import {
  appointmentListQuerySchema,
  availabilityQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from './schema.js';
import {
  checkAvailability,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
} from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../../middleware/role-guard.js';

export const appointmentsRouter = new Hono();

appointmentsRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', createAppointmentSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const appointment = await createAppointment(authed.sub, data);
      return c.json(appointment, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

appointmentsRouter.get(
  '',
  authMiddleware,
  zValidator('query', appointmentListQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const appointments = await listAppointments(query);
      return c.json(appointments, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

appointmentsRouter.get(
  '/availability',
  authMiddleware,
  zValidator('query', availabilityQuerySchema),
  async (c) => {
    try {
      const { serviceId, date, durationMinutes } = c.req.valid('query');
      const availability = await checkAvailability(serviceId, date, durationMinutes);
      return c.json(availability, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

appointmentsRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const appointment = await getAppointmentById(id);
    return c.json(appointment, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

appointmentsRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', updateAppointmentSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const appointment = await updateAppointment(authed.sub, id, data);
      return c.json(appointment, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

appointmentsRouter.delete('/:id', authMiddleware, hasRole([Role.admin, Role.user]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteAppointment(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
