import type { CreateProductInput, ProductListQuery, UpdateProductInput } from './types.js';
import { productsRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { deleteFile, extractKeyFromUrl } from '../../../core/storage/r2-client.js';
import { mediaRepository } from '../../media/repository.js';

export async function listProducts(query: ProductListQuery) {
  const { page, pageSize, search, categoryId, isPublic } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return await productsRepository.findMany({
    search,
    categoryId,
    isPublic,
    skip,
    take,
  });
}

export async function getProductById(isPublished: boolean = false, id: string) {
  return productsRepository.findById(isPublished, id);
}

export async function getProductBySlug(slug: string) {
  return productsRepository.findBySlug(slug);
}

export async function createProduct(authedId: string, data: CreateProductInput) {
  const existingSlug = await productsRepository.findBySlug(data.slug);
  const existingName = await productsRepository.findByName(data.name);
  if (existingName || existingSlug) {
    throw new ConflictError('Producto');
  }
  const product = await productsRepository.create(data);
  if (!product) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PRODUCT,
    entityId: product.id,
    action: LogAction.CREATE,
  });
  return product;
}

export async function updateProduct(authedId: string, id: string, data: UpdateProductInput) {
  const product = await productsRepository.update(id, data);
  if (!product) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PRODUCT,
    entityId: product.id,
    action: LogAction.UPDATE,
  });
  return product;
}

export async function deleteProduct(authedId: string, id: string): Promise<void> {
  const product = await productsRepository.findById(false, id);
  if (!product) {
    throw new NotFoundError('Producto');
  }
  const mediaFiles = await productsRepository.findMediaByProductId(id);
  for (const productMedia of mediaFiles) {
    const media = productMedia.media;
    if (media) {
      const key = extractKeyFromUrl(media.url);
      if (key) {
        await deleteFile(key);
      }
    }
  }
  await productsRepository.delete(id);
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PRODUCT,
    entityId: product.id,
    action: LogAction.DELETE,
  });
}

export async function getProductMedia(productId: string) {
  return productsRepository.findMediaByProductId(productId);
}

export async function attachProductMedia(productId: string, mediaId: string, orderIndex?: number) {
  return productsRepository.attachMediaToProduct({ productId, mediaId, orderIndex });
}

export async function updateProductMediaOrder(
  productId: string,
  mediaId: string,
  orderIndex: number
) {
  return productsRepository.updateProductMediaOrder({ productId, mediaId, orderIndex });
}

export async function detachProductMedia(
  productId: string,
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
  } else {
    await productsRepository.detachProductMedia({ productId, mediaId });
  }
}
