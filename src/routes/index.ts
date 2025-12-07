import { Hono } from 'hono';
import { authRouter } from '../modules/auth/routes.js';
import { userRouter } from '../modules/users/routes.js';
import { categoriesRouter } from '../modules/catalog/categories/routes.js';

export const apiRouter = new Hono();

apiRouter.get('/', (c) => {
  return c.json({
    name: 'Kumelen API',
    version: '0.1.0',
  });
});

apiRouter.route('/auth', authRouter);
apiRouter.route('/users', userRouter);
apiRouter.route('/categories', categoriesRouter);
