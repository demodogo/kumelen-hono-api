import { z } from 'zod';
import {
  createPatientRecordSchema,
  updatePatientRecordSchema,
  patientRecordListQuerySchema,
} from './schema.js';

export type CreatePatientRecordInput = z.infer<typeof createPatientRecordSchema>;
export type UpdatePatientRecordInput = z.infer<typeof updatePatientRecordSchema>;
export type PatientRecordListQuery = z.infer<typeof patientRecordListQuerySchema>;

export type FindManyArgs = {
  customerId?: string;
  updatedById?: string;
  skip?: number;
  take?: number;
};
