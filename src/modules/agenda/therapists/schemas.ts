import { z } from 'zod';

export const createTherapistSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un servicio'),
});

export const updateTherapistSchema = createTherapistSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const assignServicesSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un servicio'),
});

export const therapistIdParamSchema = z.object({
  id: z.string(),
});
