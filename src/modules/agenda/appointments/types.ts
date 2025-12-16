import { z } from 'zod';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentListQuerySchema,
} from './schema.js';

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;

export type FindManyArgs = {
  therapistId?: string;
  customerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
};
