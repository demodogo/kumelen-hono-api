import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { createSessionNoteSchema, updateSessionNoteSchema } from './schema.js';
import {
  createSessionNote,
  deleteSessionNote,
  getSessionNoteById,
  getSessionNotesByAppointment,
  getSessionNotesByCustomer,
  updateSessionNote,
} from './service.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../../middleware/role-guard.js';
import { handleError } from '../../../utils/errors.js';

export const sessionNotesRouter = new Hono();

sessionNotesRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', createSessionNoteSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const note = await createSessionNote(data);
      return c.json(note, 201);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

sessionNotesRouter.get('/appointment/:appointmentId', authMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    const notes = await getSessionNotesByAppointment(appointmentId);
    return c.json(notes, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

sessionNotesRouter.get('/customer/:customerId', authMiddleware, async (c) => {
  try {
    const customerId = c.req.param('customerId');
    const notes = await getSessionNotesByCustomer(customerId);
    return c.json(notes, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

sessionNotesRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const note = await getSessionNoteById(id);
    return c.json(note, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

sessionNotesRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', updateSessionNoteSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const note = await updateSessionNote(id, data);
      return c.json(note, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

sessionNotesRouter.delete('/:id', authMiddleware, hasRole([Role.admin, Role.user]), async (c) => {
  try {
    const id = c.req.param('id');
    await deleteSessionNote(id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    return handleError(error, c);
  }
});
