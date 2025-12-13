import { z } from 'zod';
import { type createServiceSchema, serviceListQuerySchema, updateServiceSchema } from './schema.js';

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;

export type Service = {
  id: string;
  name: string;
  slug: string;
  code: string;
  longDesc?: string;
  shortDesc?: string;
  price: number;
  cost: number;
  isActive: boolean;
  isPublished: boolean;
  durationMin: number;
  created_at: Date;
  updated_at: Date;
};

export type FindManyArgs = {
  search?: string;
  isPublic?: boolean;
  skip?: number;
  take?: number;
};

export type ServiceMedia = {
  id: string;
  serviceId: string;
  mediaId: string;
  orderIndex: number;
  media: {
    id: string;
    url: string;
    alt: string | null;
  };
};
