import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

export const changePasswordSchema = z.object({
  password: z.string().min(1, 'Requerido'),
});
