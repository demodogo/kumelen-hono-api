import { z } from 'zod';
import {
  appointmentListQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from './schema.js';
import type { AppointmentStatus } from '@prisma/client';

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;

export type FindManyArgs = {
  therapistId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
};
