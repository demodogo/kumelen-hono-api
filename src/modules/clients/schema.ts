import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  rut: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  rut: z.string().optional(),
  points: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const customerIdParamSchema = z.object({
  id: z.string(),
});

export const customerListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
