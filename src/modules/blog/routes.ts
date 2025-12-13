import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { hasRole } from '../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import {
  blogPostListQuerySchema,
  blogPostMediaAttachSchema,
  blogPostMediaParamsSchema,
  blogPostMediaUpdateSchema,
  blogPostParamSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
} from './schema.js';
import {
  attachBlogPostMedia,
  createBlogPost,
  deleteBlogPost,
  detachBlogPostMedia,
  getBlogPostById,
  getBlogPostBySlug,
  getBlogPostMedia,
  listBlogPosts,
  updateBlogPost,
  updateBlogPostMediaOrder,
} from './service.js';
import { AppError } from 'src/shared/errors/app-errors.js';

export const blogPostRouter = new Hono();

blogPostRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', createBlogPostSchema),
  async (c) => {
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const blogPost = await createBlogPost(authed.sub, data);
      return c.json(blogPost, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

blogPostRouter.get('', authMiddleware, zValidator('query', blogPostListQuerySchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const blogPosts = await listBlogPosts(query);
    return c.json(blogPosts, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

blogPostRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const blogPost = await getBlogPostById(id);
    return c.json(blogPost, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error ' }, 500);
  }
});

blogPostRouter.get('/slug/:slug', authMiddleware, async (c) => {
  try {
    const slug = c.req.param('slug');
    const blogPost = await getBlogPostBySlug(slug);
    return c.json(blogPost, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error ' }, 500);
  }
});

blogPostRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('json', updateBlogPostSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const blogPost = await updateBlogPost(authed.sub, id, data);
      return c.json(blogPost, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

blogPostRouter.delete('/:id', authMiddleware, hasRole([Role.admin, Role.user]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteBlogPost(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json({ message: error.message, code: error.code }, error.statusCode as any);
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
});

blogPostRouter.get(
  '/:id/media',
  authMiddleware,
  zValidator('param', blogPostParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const items = await getBlogPostMedia(id);
      return c.json(items, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

blogPostRouter.post(
  '/:id/media',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', blogPostParamSchema),
  zValidator('json', blogPostMediaAttachSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { mediaId, orderIndex } = c.req.valid('json');
      const item = await attachBlogPostMedia(id, mediaId, orderIndex);
      return c.json(item, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

blogPostRouter.patch(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', blogPostMediaParamsSchema),
  zValidator('json', blogPostMediaUpdateSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      const { orderIndex } = c.req.valid('json');
      const item = await updateBlogPostMediaOrder(id, mediaId, orderIndex);
      return c.json(item, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);

blogPostRouter.delete(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', blogPostMediaParamsSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      const deleteFromStorage = c.req.query('deleteFile') === 'true';
      await detachBlogPostMedia(id, mediaId, deleteFromStorage);
      return c.json({ message: 'OK' }, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json({ message: error.message, code: error.code }, error.statusCode as any);
      }
      return c.json({ message: 'Internal server error' }, 500);
    }
  }
);
