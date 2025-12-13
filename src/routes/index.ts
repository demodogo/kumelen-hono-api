import { Hono } from 'hono';
import { authRouter } from '../modules/auth/routes.js';
import { authPublicRouter } from '../modules/auth/public-routes.js';
import { userRouter } from '../modules/users/routes.js';
import { catalogRouter } from '../modules/catalog/routes.js';
import { logsRouter } from '../modules/app-logs/routes.js';
import { mediaRouter } from '../modules/media/routes.js';
import { blogPostRouter } from '../modules/blog/routes.js';

export const apiPrivateRouter = new Hono().basePath('/private');
apiPrivateRouter.get('/', (c) => {
  return c.json({
    name: 'Kumelen API',
    version: '0.1.0',
  });
});

apiPrivateRouter.route('/auth', authRouter);
apiPrivateRouter.route('/users', userRouter);
apiPrivateRouter.route('/catalog', catalogRouter);
apiPrivateRouter.route('/logs', logsRouter);
apiPrivateRouter.route('/media', mediaRouter);
apiPrivateRouter.route('/blog', blogPostRouter);

export const apiPublicRouter = new Hono().basePath('/public');

apiPublicRouter.route('/auth', authPublicRouter);
