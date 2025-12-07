import { Hono } from 'hono';
import { categoriesRouter } from './categories/routes.js';

export const catalogRouter = new Hono();

catalogRouter.route('/categories', categoriesRouter);
