import { z } from 'zod';
import {
  blogPostListQuerySchema,
  type createBlogPostSchema,
  updateBlogPostSchema,
} from './schema.js';

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogPostListQuery = z.infer<typeof blogPostListQuerySchema>;

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt?: string;
  tags: string[];
  authorId: string;
  created_at: Date;
  updated_at: Date;
};

export type FindManyArgs = {
  search?: string;
  slug?: string;
  tags?: string[];
  skip?: number;
  take?: number;
};

export type BlogPostMedia = {
  id: string;
  blogPostId: string;
  mediaId: string;
  orderIndex: number;
  media: {
    id: string;
    url: string;
    alt: string | null;
  };
};
