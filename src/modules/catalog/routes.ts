import { Hono } from 'hono';
import { categoriesRouter } from './categories/routes.js';
import { productsRouter } from './products/routes.js';
import { servicesRouter } from './services/routes.js';
import { zValidator } from '@hono/zod-validator';
import {
  getAll as getAllCatalog,
  getById as getByIdCatalog,
} from '../catalog/categories/service.js';
import { productListQuerySchema } from './products/schemas.js';
import { getProductById, listProducts } from './products/service.js';
import { serviceListQuerySchema } from './services/schema.js';
import { getServiceById, listServices } from './services/service.js';

export const catalogRouter = new Hono();

catalogRouter.route('/categories', categoriesRouter);
catalogRouter.route('/products', productsRouter);
catalogRouter.route('/services', servicesRouter);

export const catalogPublicRouter = new Hono();

catalogPublicRouter.get('', async (c) => {
  const catalog = await getAllCatalog(true, { products: true });
  return c.json(catalog, 200);
});

catalogPublicRouter.get('/products', zValidator('query', productListQuerySchema), async (c) => {
  const { categoryId, search, page, pageSize } = c.req.valid('query');
  const products = await listProducts({
    ...(search && { search }),
    ...(categoryId && { categoryId }),
    page,
    pageSize,
    isPublic: true,
  });
  return c.json(products, 200);
});

catalogPublicRouter.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  const product = await getProductById(true, id);
  if (product && product.isPublished) {
    return c.json(product, 200);
  }
  return c.json([], 200);
});

catalogPublicRouter.get('/services', zValidator('query', serviceListQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const services = await listServices({
    ...query,
    isPublic: true,
  });
  return c.json(services, 200);
});

catalogPublicRouter.get('/services/:id', async (c) => {
  const id = c.req.param('id');
  const service = await getServiceById(id, false);
  if (service && service.isPublished) {
    return c.json(service, 200);
  }
  return c.json([], 200);
});

catalogPublicRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const category = await getByIdCatalog(id, true, { products: true });
  return c.json(category, 200);
});
