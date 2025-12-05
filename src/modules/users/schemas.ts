import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
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
