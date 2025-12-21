import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { DateTime } from 'luxon';

function isIsoDateTimeWithOrWithoutOffset(value: string) {
  if (DateTime.fromISO(value, { setZone: true }).isValid) return true;
  return DateTime.fromISO(value).isValid;
}

const createAppointmentBaseSchema = z.object({
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
  startAt: z.string().refine(isIsoDateTimeWithOrWithoutOffset, 'Fecha inválida'),
  endAt: z.string().refine(isIsoDateTimeWithOrWithoutOffset, 'Fecha inválida').optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
});

export const createAppointmentSchema = createAppointmentBaseSchema
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

export const updateAppointmentSchema = createAppointmentBaseSchema
  .partial()
  .omit({
    customerData: true,
  })
  .extend({
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  therapistId: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
});
