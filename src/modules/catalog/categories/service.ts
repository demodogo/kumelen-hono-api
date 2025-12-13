import type { CreateCategoryInput, UpdateCategoryInput } from './types.js';
import { categoriesRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { prisma } from '../../../db/prisma.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';

export async function createCategory(authedId: string, data: CreateCategoryInput) {
  const existing = await categoriesRepository.findBySlugOrName(data.name, data.slug);
  if (existing) {
    throw new ConflictError('Category');
  }
  const category = await categoriesRepository.createCategory(data);
  if (!category) {
    throw new InternalServerError('Could not create category');
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.CATEGORY,
    entityId: category.id,
  });

  return category;
}

export async function getById(
  id: string,
  includeOptions?: { services: boolean; products: boolean }
) {
  const category = await categoriesRepository.findById(id, includeOptions);
  if (!category) {
    throw new NotFoundError('Category');
  }
  return category;
}

export async function getAll(includeOptions?: { services: boolean; products: boolean }) {
  return categoriesRepository.findAll(includeOptions);
}

export async function updateCategory(authedId: string, id: string, data: UpdateCategoryInput) {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new NotFoundError('Category');
  }

  if (data.name) {
    const existingByName = await categoriesRepository.findByName(data.name);
    if (existingByName && existingByName.id !== id) {
      throw new ConflictError('Category');
    }
  }
  if (data.slug) {
    const existingBySlug = await categoriesRepository.findBySlug(data.slug);
    if (existingBySlug && existingBySlug.id !== id) {
      throw new ConflictError('Category');
    }
  }

  const updated = await categoriesRepository.update(id, data);
  if (!updated) {
    throw new InternalServerError('Could not update category');
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.UPDATE,
    entity: EntityType.CATEGORY,
    entityId: id,
  });
  return updated;
}

export async function deleteCategory(authedId: string, id: string) {
  const category = await categoriesRepository.findById(id, { products: true });
  if (!category) {
    throw new NotFoundError('Category');
  }
  if (category.products.length > 0) {
    await Promise.all(
      category.products.map((p: { id: any }) =>
        prisma.product.update({
          where: { id: p.id },
          data: {
            category: {
              connect: {
                slug: 'default',
              },
            },
          },
        })
      )
    );
  }
  const deleted = await categoriesRepository.delete(id);
  if (!deleted) {
    throw new InternalServerError('Could not delete category');
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.DELETE,
    entity: EntityType.CATEGORY,
    entityId: id,
  });
  return {
    success: true,
    message: `Deleted category and updated ${category.products.length} products.`,
  };
}
