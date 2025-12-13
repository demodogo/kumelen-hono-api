import { z } from 'zod';
import { DayOfWeek } from '@prisma/client';

export const scheduleItemSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
});

export const createScheduleSchema = z.object({
  therapistId: z.string().min(1, 'Requerido'),
  schedules: z.array(scheduleItemSchema).min(1, 'Debe proporcionar al menos un horario'),
});

export const updateScheduleSchema = z.object({
  therapistId: z.string().min(1, 'Requerido'),
  schedules: z.array(scheduleItemSchema).min(1, 'Debe proporcionar al menos un horario'),
});

export const scheduleIdParamSchema = z.object({
  id: z.string(),
});
