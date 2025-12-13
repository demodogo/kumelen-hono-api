import { z } from 'zod';
import { type createScheduleSchema, updateScheduleSchema, scheduleItemSchema } from './schema.js';

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ScheduleItem = z.infer<typeof scheduleItemSchema>;
