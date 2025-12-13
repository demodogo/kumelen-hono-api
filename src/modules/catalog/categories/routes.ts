import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { createCategorySchema, getCategoriesQuerySchema, updateCategorySchema } from './schemas.js';
import { createCategory, deleteCategory, getAll, getById, updateCategory } from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { hasRole } from '../../../middleware/role-guard.js';
import { Role } from '@prisma/client';

export const categoriesRouter = new Hono();

categoriesRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', createCategorySchema),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const authed = c.get('user');
      const category = await createCategory(authed.sub, data);
      return c.json(category, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }

      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

categoriesRouter.get(
  '',
  authMiddleware,
  zValidator('query', getCategoriesQuerySchema),
  async (c) => {
    try {
      const { include } = c.req.valid('query');

      const includeOptions = {
        services: include === 'services' || include === 'all',
        products: include === 'products' || include === 'all',
      };
      const categories = await getAll(includeOptions);
      return c.json(categories, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

categoriesRouter.get(
  '/:id',
  authMiddleware,
  zValidator('query', getCategoriesQuerySchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const { include } = c.req.valid('query');

      const includeOptions = {
        services: include === 'services' || include === 'all',
        products: include === 'products' || include === 'all',
      };
      const category = await getById(id, includeOptions);
      return c.json(category, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

categoriesRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateCategorySchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const category = await updateCategory(authed.sub, id, data);
      return c.json(category, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

categoriesRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteCategory(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});
