import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import type { Context, Next } from 'hono';
import type { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.sub || typeof payload.username !== 'string' || !payload.role) {
      return c.json({ message: 'Invalid token payload' }, 401);
    }

    c.set('user', {
      sub: payload.sub,
      username: payload.username,
      role: payload.role as Role,
    });

    await next();
  } catch (err) {
    return c.json({ message: 'Invalid or expired token' }, 401);
  }
};
