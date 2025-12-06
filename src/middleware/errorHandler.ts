import type { Context } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-errors.js';

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        message: 'Validation error',
        errors: err.flatten().fieldErrors,
      },
      400
    );
  }
  if (err instanceof AppError) {
    return c.json({ message: err.message, code: err.code }, err.statusCode as any);
  }
  console.error('Unhandled Error:', err);

  return c.json({ message: 'Internal server error' }, 500);
};
