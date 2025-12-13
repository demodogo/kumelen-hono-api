import { z } from 'zod';
import {
  assignServicesSchema,
  type createTherapistSchema,
  updateTherapistSchema,
} from './schemas.js';

export type CreateTherapistInput = z.infer<typeof createTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof updateTherapistSchema>;
export type AssignServicesInput = z.infer<typeof assignServicesSchema>;
