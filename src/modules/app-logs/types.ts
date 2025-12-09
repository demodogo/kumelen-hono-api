import { z } from 'zod';
import type { createAppLogSchema } from './schemas.js';

export type CreateLogInput = z.infer<typeof createAppLogSchema>;
