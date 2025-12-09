import type { CreateProductInput, ProductListQuery, UpdateProductInput } from './types.js';
import { productsRepository } from './repository.js';
import { ConflictError, InternalServerError } from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';

export async function listProducts(query: ProductListQuery) {
  const { page, pageSize, search, categoryId, isPublic } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [items, total] = await productsRepository.findManyWithCount({
    search,
    categoryId,
    isPublic,
    skip,
    take,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getProductById(id: string) {
  return productsRepository.findById(id);
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
  const product = await productsRepository.findById(id);
  if (!product) {
    throw new InternalServerError();
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

export async function detachProductMedia(productId: string, mediaId: string) {
  return productsRepository.detachProductMedia({ productId, mediaId });
}
