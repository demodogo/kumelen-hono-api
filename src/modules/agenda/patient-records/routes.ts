import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import {
  createPatientRecordSchema,
  patientRecordListQuerySchema,
  updatePatientRecordSchema,
} from './schema.js';
import {
  createPatientRecord,
  deletePatientRecord,
  getPatientRecordById,
  getPatientRecordsByCustomer,
  listPatientRecords,
  updatePatientRecord,
} from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../../middleware/role-guard.js';
import { logger } from '../../../core/logger.js';

export const patientRecordsRouter = new Hono();

patientRecordsRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', createPatientRecordSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const record = await createPatientRecord(authed.sub, data);
      return c.json(record, 201);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

patientRecordsRouter.get(
  '',
  authMiddleware,
  zValidator('query', patientRecordListQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const records = await listPatientRecords(query);
      return c.json(records, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

patientRecordsRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await getPatientRecordById(id);
    return c.json(record, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

patientRecordsRouter.get('/customer/:customerId', authMiddleware, async (c) => {
  try {
    const customerId = c.req.param('customerId');
    const records = await getPatientRecordsByCustomer(customerId);
    return c.json(records, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

patientRecordsRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', updatePatientRecordSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const record = await updatePatientRecord(authed.sub, id, data);
      return c.json(record, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

patientRecordsRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deletePatientRecord(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
