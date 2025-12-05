import { Role } from '@prisma/client';
import type { Context, Next } from 'hono';

export const hasRole = (roles: Role[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    await next();
  };
};
