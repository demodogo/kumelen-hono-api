import { z } from 'zod';

export const createAppLogSchema = z.object({
  userId: z.string(),
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
    'MEDIA',
    'BLOG',
  ]),
  entityId: z.string(),
  details: z.string().optional(),
});
