import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
  productMediaAttachSchema,
  productMediaParamsSchema,
  productMediaUpdateSchema,
  updateProductSchema,
} from './schemas.js';
import {
  attachProductMedia,
  createProduct,
  deleteProduct,
  detachProductMedia,
  getProductById,
  getProductBySlug,
  getProductMedia,
  listProducts,
  updateProduct,
  updateProductMediaOrder,
} from './service.js';
import { AppError } from '../../../shared/errors/app-errors.js';
import { Role } from '@prisma/client';
import { hasRole } from '../../../middleware/role-guard.js';

export const productsRouter = new Hono();

productsRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', createProductSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const product = await createProduct(authed.sub, data);
      return c.json(product, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

productsRouter.get('', authMiddleware, zValidator('query', productListQuerySchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const products = await listProducts(query);
    return c.json(products, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

productsRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const product = await getProductById(id);
    return c.json(product, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error ' }, 500);
  }
});

productsRouter.get('/slug/:slug', authMiddleware, async (c) => {
  try {
    const slug = c.req.param('slug');
    const product = await getProductBySlug(slug);
    return c.json(product, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error ' }, 500);
  }
});

productsRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateProductSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const product = await updateProduct(authed.sub, id, data);
      return c.json(product, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

productsRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteProduct(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

productsRouter.get(
  '/:id/media',
  authMiddleware,
  zValidator('param', productIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const items = await getProductMedia(id);
      return c.json(items, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

productsRouter.post(
  '/:id/media',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', productIdParamSchema),
  zValidator('json', productMediaAttachSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { mediaId, orderIndex } = c.req.valid('json');
      const item = await attachProductMedia(id, mediaId, orderIndex);
      return c.json(item, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

productsRouter.patch(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', productMediaParamsSchema),
  zValidator('json', productMediaUpdateSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      const { orderIndex } = c.req.valid('json');
      const item = await updateProductMediaOrder(id, mediaId, orderIndex);
      return c.json(item, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

productsRouter.delete(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', productMediaParamsSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      const deleteFromStorage = c.req.query('deleteFile') === 'true';
      await detachProductMedia(id, mediaId, deleteFromStorage);
      return c.json({ message: 'OK' }, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
