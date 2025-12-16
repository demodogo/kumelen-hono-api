import { z } from 'zod';
import { createCustomerSchema, updateCustomerSchema, customerListQuerySchema } from './schema.js';

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

export type FindManyArgs = {
  search?: string;
  skip?: number;
  take?: number;
};
