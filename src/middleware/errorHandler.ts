import type { Context } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-errors.js';
import { logger } from '../core/logger.js';

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof ZodError) {
    logger.warn({ errors: err.flatten().fieldErrors, path: c.req.path }, 'Validation error');
    return c.json(
      {
        message: 'Validation error',
        errors: err.flatten().fieldErrors,
      },
      400
    );
  }
  if (err instanceof AppError) {
    logger.error({ error: err.message, code: err.code, path: c.req.path }, 'Application error');
    return c.json({ message: err.message, code: err.code }, err.statusCode as any);
  }

  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
    },
    'Unhandled error'
  );

  return c.json({ message: 'Internal server error' }, 500);
};
