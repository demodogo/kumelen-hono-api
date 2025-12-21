import type { MiddlewareHandler } from 'hono';
import { logger } from '../core/logger.js';

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();

  try {
    await next();
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(
      {
        method: c.req.method,
        path: c.req.path,
        duration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Request failed with error'
    );
    throw error;
  }

  const duration = Date.now() - start;

  const responseBody = await c.res
    .clone()
    .json()
    .catch(async () => {
      try {
        return await c.res.clone().text();
      } catch {
        return null;
      }
    });

  const logPayload = {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    responseBody,
  };

  if (c.res.status >= 500) {
    logger.error(logPayload, 'request completed with server error');
    return;
  }

  if (c.res.status >= 400) {
    logger.warn(logPayload, 'request completed with client error');
    return;
  }

  logger.info(logPayload, 'request completed');
};
