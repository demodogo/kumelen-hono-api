import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { hasRole } from '../../../middleware/role-guard.js';
import { Role } from '@prisma/client';
import { zValidator } from '@hono/zod-validator';
import {
  createServiceSchema,
  serviceIdParamSchema,
  serviceListQuerySchema,
  serviceMediaAttachSchema,
  serviceMediaParamsSchema,
  serviceMediaUpdateSchema,
  updateServiceSchema,
} from './schema.js';
import {
  attachMediaToService,
  createService,
  deleteService,
  detachServiceMedia,
  getServiceById,
  getServiceMedia,
  listServices,
  updateService,
  updateServiceMediaOrder,
} from './service.js';
import { zValidatorLog } from '../../../middleware/zValidatorLog.js';
import { handleError } from '../../../utils/errors.js';

export const servicesRouter = new Hono();

servicesRouter.post(
  '',
  authMiddleware,
  hasRole([Role.admin]),
  zValidatorLog('json', createServiceSchema),
  async (c) => {
    // @ts-ignore
    const data = c.req.valid('json');
    try {
      const authed = c.get('user');
      const service = await createService(authed.sub, data);
      return c.json(service, 201);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

servicesRouter.get('', authMiddleware, zValidator('query', serviceListQuerySchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const services = await listServices(query);
    return c.json(services, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

servicesRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const service = await getServiceById(id);
    return c.json(service, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

servicesRouter.patch(
  '/:id',
  authMiddleware,
  hasRole([Role.admin]),
  zValidator('json', updateServiceSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authed = c.get('user');
      const service = await updateService(authed.sub, id, data);
      return c.json(service, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

servicesRouter.delete('/:id', authMiddleware, hasRole([Role.admin]), async (c) => {
  try {
    const id = c.req.param('id');
    const authed = c.get('user');
    await deleteService(authed.sub, id);
    return c.json({ message: 'OK' }, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

servicesRouter.get('/:id/media', zValidator('param', serviceIdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const items = await getServiceMedia(id);
    return c.json(items, 200);
  } catch (error) {
    return handleError(error, c);
  }
});

servicesRouter.post(
  '/:id/media',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', serviceIdParamSchema),
  zValidator('json', serviceMediaAttachSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { mediaId, orderIndex } = c.req.valid('json');
      const item = await attachMediaToService(id, mediaId, orderIndex);
      return c.json(item, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

servicesRouter.patch(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', serviceMediaParamsSchema),
  zValidator('json', serviceMediaUpdateSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      const { orderIndex } = c.req.valid('json');
      const item = await updateServiceMediaOrder(id, mediaId, orderIndex);
      return c.json(item, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);

servicesRouter.delete(
  '/:id/media/:mediaId',
  authMiddleware,
  hasRole([Role.admin, Role.user]),
  zValidator('param', serviceMediaParamsSchema),
  async (c) => {
    try {
      const { id, mediaId } = c.req.valid('param');
      await detachServiceMedia(id, mediaId);
      return c.json({ message: 'OK' }, 200);
    } catch (error) {
      return handleError(error, c);
    }
  }
);
