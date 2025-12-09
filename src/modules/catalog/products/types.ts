import { z } from 'zod';
import { createProductSchema, productListQuerySchema, updateProductSchema } from './schemas.js';

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export type Product = {
  id: string;
  name: string;
  slug: string;
  longDesc?: string;
  shortDesc?: string;
  price: number;
  cost: number;
  minStock: number;
  isActive: boolean;
  isPublished: boolean;
  stock: number;
  sku?: string;
  categoryId: string;
  created_at: Date;
  updated_at: Date;
};

export type FindManyArgs = {
  search?: string;
  categoryId?: string;
  isPublic?: boolean;
  skip?: number;
  take?: number;
};

export type ProductMedia = {
  id: string;
  productId: string;
  mediaId: string;
  orderIndex: number;
  media: {
    id: string;
    url: string;
    alt: string | null;
  };
};
