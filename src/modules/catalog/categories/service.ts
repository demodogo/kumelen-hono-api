import type { CreateCategoryInput, UpdateCategoryInput } from './types.js';
import { categoriesRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { prisma } from '../../../db/prisma.js';

export async function createCategory(authedId: string, data: CreateCategoryInput) {
  const existing = await categoriesRepository.findBySlugOrName(data.name, data.slug);
  if (existing) {
    throw new ConflictError('Category');
  }
  const category = await categoriesRepository.createCategory(authedId, data);
  if (!category) {
    throw new InternalServerError('Could not create category');
  }
  return category;
}

export async function getById(id: string, includeCatalog: boolean = false) {
  const category = await categoriesRepository.findById(id, includeCatalog);
  if (!category) {
    throw new NotFoundError('Category');
  }
  return category;
}

export async function getAll(includeCatalog: boolean = false) {
  const categories = await categoriesRepository.findAll(includeCatalog);
  if (!categories) {
    throw new InternalServerError('Could not find categories');
  }
  return categories;
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const category = await categoriesRepository.findById(id);
  if (!category) {
    throw new NotFoundError('Category');
  }
  const updated = await categoriesRepository.update(id, data);
  if (!updated) {
    throw new InternalServerError('Could not update category');
  }
  return updated;
}

export async function deleteCategory(id: string) {
  const category = await categoriesRepository.findById(id, true);
  if (!category) {
    throw new NotFoundError('Category');
  }
  if (category.products.length > 0) {
    category.products.map(async (p) => {
      return prisma.product.update({
        where: { id: p.id },
        data: {
          category: {
            connect: {
              slug: 'default',
            },
          },
        },
      });
    });
  }
  const deleted = await categoriesRepository.delete(id);
  if (!deleted) {
    throw new InternalServerError('Could not delete category');
  }
  return {
    success: true,
    message: `Deleted category and updated ${category.products.length} products.`,
  };
}
