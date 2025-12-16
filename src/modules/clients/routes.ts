import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { createCustomerSchema, customerListQuerySchema, updateCustomerSchema } from './schema.js';
import {
  addCustomerPoints,
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  subtractCustomerPoints,
  updateCustomer,
} from './service.js';
import { AppError } from '../../shared/errors/app-errors.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../middleware/role-guard.js';
import { z } from 'zod';

export const customersRouter = new Hono();

customersRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', createCustomerSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const customer = await createCustomer(authed.sub, data);
      return c.json(customer, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

customersRouter.get('', authMiddleware, zValidator('query', customerListQuerySchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const customers = await listCustomers(query);
    return c.json(customers, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

customersRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const customer = await getCustomerById(id);
    return c.json(customer, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

customersRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', updateCustomerSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const customer = await updateCustomer(authed.sub, id, data);
      return c.json(customer, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

customersRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteCustomer(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

const pointsSchema = z.object({
  points: z.number().int().positive(),
});

customersRouter.post(
  '/:id/points/add',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', pointsSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const { points } = c.req.valid('json');
      const authed = c.get('user');
      const customer = await addCustomerPoints(authed.sub, id, points);
      return c.json(customer, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

customersRouter.post(
  '/:id/points/subtract',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', pointsSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const { points } = c.req.valid('json');
      const authed = c.get('user');
      const customer = await subtractCustomerPoints(authed.sub, id, points);
      return c.json(customer, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
