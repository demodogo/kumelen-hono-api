import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

export const createAppointmentSchema = z
  .object({
    customerId: z.string().optional(),
    customerData: z
      .object({
        name: z.string().min(1, 'Nombre requerido'),
        lastName: z.string().optional(),
        email: z.string().email('Email inválido').optional(),
        phone: z.string().optional(),
        rut: z.string().optional(),
      })
      .optional(),
    therapistId: z.string().optional(),
    serviceId: z.string().min(1, 'Requerido'),
    appointmentDate: z.string().datetime('Fecha inválida'),
    durationMinutes: z.number().int().positive().optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.customerId || data.customerData, {
    message: 'Debe proporcionar customerId o customerData',
    path: ['customerId'],
  })
  .refine(
    (data) => {
      if (data.customerData) {
        return data.customerData.email || data.customerData.phone || data.customerData.rut;
      }
      return true;
    },
    {
      message: 'Debe proporcionar al menos email, teléfono o RUT para el cliente',
      path: ['customerData'],
    }
  );

export const updateAppointmentSchema = z.object({
  customerId: z.string().optional(),
  therapistId: z.string().optional(),
  serviceId: z.string().optional(),
  appointmentDate: z.string().datetime('Fecha inválida').optional(),
  durationMinutes: z.number().int().positive().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  reminderSent: z.boolean().optional(),
});

export const appointmentIdParamSchema = z.object({
  id: z.string(),
});

export const appointmentListQuerySchema = z.object({
  therapistId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1, 'Requerido'),
  date: z.string().datetime('Fecha inválida'),
  durationMinutes: z.coerce.number().int().positive().optional(),
});
