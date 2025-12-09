import { z } from 'zod';
import { mediaCreateSchema, mediaUpdateSchema, presignMediaSchema } from './schemas.js';

export type CreateMediaInput = z.infer<typeof mediaCreateSchema>;
export type UpdateMediaInput = z.infer<typeof mediaUpdateSchema>;
export type PresignMediaInput = z.infer<typeof presignMediaSchema>;

export type Media = {
  id: string;
  url: string;
  alt: string | null;
  created_at: Date;
  updated_at: Date;
};
