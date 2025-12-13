import { ZodError, ZodSchema } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Context, MiddlewareHandler } from 'hono';
import type { ValidationTargets } from 'hono/types';

export const zValidatorLog = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets = keyof ValidationTargets,
>(
  target: Target,
  schema: T
): MiddlewareHandler => {
  return async (c: Context, next: () => Promise<void>) => {
    let rawBody: string | undefined;

    if (target === 'json') {
      try {
        const clonedReq = c.req.raw.clone();
        rawBody = await clonedReq.text();
      } catch (err) {
        console.error('Could not clone request:', err);
      }
    }

    const validator = zValidator(target, schema, async (result, c) => {
      if (!result.success) {
        console.error('Zod validation error:', result.error.errors);

        if (rawBody) {
          console.error('Request raw body:', rawBody);
        }

        return c.json(
          {
            success: false,
            error: result.error,
          },
          400
        );
      }
    });

    return validator(c, next);
  };
};
