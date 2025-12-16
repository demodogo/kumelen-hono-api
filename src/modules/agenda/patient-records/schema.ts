import { z } from 'zod';

export const createPatientRecordSchema = z.object({
  customerId: z.string().min(1, 'Cliente requerido'),
  generalNotes: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

export const updatePatientRecordSchema = z.object({
  generalNotes: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

export const patientRecordIdParamSchema = z.object({
  id: z.string(),
});

export const customerIdParamSchema = z.object({
  customerId: z.string(),
});

export const patientRecordListQuerySchema = z.object({
  customerId: z.string().optional(),
  updatedById: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
