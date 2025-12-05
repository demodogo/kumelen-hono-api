import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
  name: z.string().min(1, 'Requerido'),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'sales', 'user']).default(Role.user),
});

export const updateUserSchema = createUserSchema
  .pick({
    name: true,
    lastName: true,
    role: true,
  })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
