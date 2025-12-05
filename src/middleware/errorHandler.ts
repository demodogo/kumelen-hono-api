import type { Context } from 'hono';
import { ZodError } from 'zod';
import { AuthError } from '../modules/auth/errors.js';

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
  if (err instanceof AuthError) {
    return c.json({ message: err.message, code: err.code }, err.status as any);
  }
  console.error('Unhandled Error:', err);

  return c.json({ message: 'Internal server error' }, 500);
};
