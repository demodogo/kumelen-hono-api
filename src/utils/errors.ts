import { AppError } from '../shared/errors/app-errors.js';
import { logger } from '../core/logger.js';

export function handleError(error: unknown, c: any) {
  logger.error(
    {
      method: c?.req?.method,
      path: c?.req?.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    'Request handler error'
  );

  if (error instanceof AppError) {
    return c.json({ message: error.message, code: error.code }, error.statusCode as any);
  }
  return c.json({ message: 'Internal server error' }, 500);
}
