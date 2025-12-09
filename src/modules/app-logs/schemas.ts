import { z } from 'zod';

export const createAppLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']),
  entity: z.enum([
    'USER',
    'PRODUCT',
    'SERVICE',
    'CATEGORY',
    'SALE',
    'CUSTOMER',
    'POS_SESSION',
    'AUTH',
  ]),
  entityId: z.string().uuid(),
  details: z.string().optional(),
});
