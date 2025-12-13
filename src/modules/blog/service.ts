import { blogRepository } from './repository.js';
import type { BlogPostListQuery, CreateBlogPostInput, UpdateBlogPostInput } from './types.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../shared/errors/app-errors.js';
import { appLogsRepository } from '../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { mediaRepository } from '../media/repository.js';
import { deleteFile, extractKeyFromUrl } from '../../core/storage/r2-client.js';

export async function listBlogPosts(query: BlogPostListQuery) {
  const { page, pageSize, search, slug, tags } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return await blogRepository.findMany({
    search,
    slug,
    tags,
    skip,
    take,
  });
}

export async function getBlogPostById(id: string) {
  return blogRepository.findById(id);
}

export async function getBlogPostBySlug(slug: string) {
  return blogRepository.findBySlug(slug);
}

export async function createBlogPost(authedId: string, data: CreateBlogPostInput) {
  const existingSlug = await blogRepository.findBySlug(data.slug);
  if (existingSlug) {
    throw new ConflictError('Blog post ');
  }
  const blogPost = await blogRepository.create(authedId, data);
  if (!blogPost) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.BLOG,
    entityId: blogPost.id,
    action: LogAction.CREATE,
  });
  return blogPost;
}

export async function updateBlogPost(authedId: string, id: string, data: UpdateBlogPostInput) {
  const blogPost = await blogRepository.update(id, data);
  if (!blogPost) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.BLOG,
    entityId: blogPost.id,
    action: LogAction.UPDATE,
  });
  return blogPost;
}

export async function deleteBlogPost(authedId: string, id: string): Promise<void> {
  const blogPost = await blogRepository.findById(id);
  if (!blogPost) {
    throw new NotFoundError('Blog post');
  }
  await blogRepository.delete(id);
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.BLOG,
    entityId: blogPost.id,
    action: LogAction.DELETE,
  });
}

export async function getBlogPostMedia(blogPostId: string) {
  return blogRepository.findMediaByBlogPostId(blogPostId);
}

export async function attachBlogPostMedia(
  blogPostId: string,
  mediaId: string,
  orderIndex?: number
) {
  return blogRepository.attachMediaToBlogPost({ blogPostId, mediaId, orderIndex });
}

export async function updateBlogPostMediaOrder(
  blogPostId: string,
  mediaId: string,
  orderIndex: number
) {
  return blogRepository.updateBlogPostMediaOrder({ blogPostId, mediaId, orderIndex });
}

export async function detachBlogPostMedia(
  blogPostId: string,
  mediaId: string,
  deleteFromStorage = false
) {
  if (deleteFromStorage) {
    const media = await mediaRepository.findById(mediaId);
    if (media) {
      const key = extractKeyFromUrl(media.url);
      if (key) {
        await deleteFile(key);
      }
      await mediaRepository.deleteMedia(mediaId);
    }
  }
  return blogRepository.detachBlogPostMedia({ blogPostId, mediaId });
}
