import { z } from 'zod';

export const createSessionNoteSchema = z.object({
  appointmentId: z.string().min(1, 'Requerido'),
  notes: z.string().min(1, 'Requerido'),
  observations: z.string().optional(),
  nextSteps: z.string().optional(),
});

export const updateSessionNoteSchema = z.object({
  notes: z.string().optional(),
  observations: z.string().optional(),
  nextSteps: z.string().optional(),
});

export const sessionNoteIdParamSchema = z.object({
  id: z.string(),
});

export const appointmentIdParamSchema = z.object({
  appointmentId: z.string(),
});

export const customerIdParamSchema = z.object({
  customerId: z.string(),
});
