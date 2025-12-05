import type { Role } from '@prisma/client';

type Variables = {
  user: {
    sub: string;
    username: string;
    role: Role;
  };
};

declare module 'hono' {
  interface ContextVariableMap extends Variables {}
}
