import { buildWhere } from './helpers.js';
import { prisma } from '../../db/prisma.js';
import type {
  BlogPostMedia,
  CreateBlogPostInput,
  FindManyArgs,
  UpdateBlogPostInput,
} from './types.js';

export const blogRepository = {
  async findMany(args: FindManyArgs) {
    const { search, skip, take, slug, tags } = args;
    const where = buildWhere({ search, slug, tags });

    const items = await prisma.blogPost.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        mediaFiles: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      mediaFiles: item.mediaFiles.sort((a, b) => b.orderIndex - a.orderIndex),
    }));
  },

  findById(id: string) {
    return prisma.blogPost.findUnique({ where: { id } });
  },

  async create(authedId: string, data: CreateBlogPostInput) {
    return prisma.blogPost.create({
      data: {
        ...data,
        authorId: authedId,
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.blogPost.findUnique({ where: { slug } });
  },

  findByTitle(title: string) {
    return prisma.blogPost.findFirst({ where: { title } });
  },

  update(id: string, data: UpdateBlogPostInput) {
    return prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
    });
  },

  delete(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  },

  async findMediaByBlogPostId(blogPostId: string) {
    const items = await prisma.blogPostMedia.findMany({
      where: { blogPostId },
      include: { media: true },
    });
    return items as unknown as BlogPostMedia[];
  },

  async attachMediaToBlogPost(args: { blogPostId: string; mediaId: string; orderIndex?: number }) {
    const { blogPostId, mediaId, orderIndex } = args;
    let finalIndex = orderIndex;
    if (finalIndex === undefined) {
      const last = await prisma.blogPostMedia.findFirst({
        where: { blogPostId },
        orderBy: { orderIndex: 'desc' },
      });
      finalIndex = last ? last.orderIndex + 1 : 0;
    }
    const item = await prisma.blogPostMedia.create({
      data: {
        blogPostId,
        mediaId,
        orderIndex: finalIndex,
      },
      include: { media: true },
    });

    return item as unknown as BlogPostMedia;
  },

  async updateBlogPostMediaOrder(args: {
    blogPostId: string;
    mediaId: string;
    orderIndex: number;
  }) {
    const { blogPostId, mediaId, orderIndex } = args;

    const item = await prisma.blogPostMedia.update({
      where: {
        blogPostId_mediaId: {
          blogPostId,
          mediaId,
        },
      },
      data: { orderIndex },
      include: { media: true },
    });

    return item as unknown as BlogPostMedia;
  },

  async detachBlogPostMedia(args: { blogPostId: string; mediaId: string }) {
    const { blogPostId, mediaId } = args;
    await prisma.blogPostMedia.delete({
      where: {
        blogPostId_mediaId: {
          blogPostId,
          mediaId,
        },
      },
    });
  },
};
