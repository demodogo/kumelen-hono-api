import { z } from 'zod';
import { createSessionNoteSchema, updateSessionNoteSchema } from './schema.js';

export type CreateSessionNoteInput = z.infer<typeof createSessionNoteSchema>;
export type UpdateSessionNoteInput = z.infer<typeof updateSessionNoteSchema>;
