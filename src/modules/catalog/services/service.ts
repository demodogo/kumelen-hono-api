import type { CreateServiceInput, ServiceListQuery, UpdateServiceInput } from './types.js';
import { servicesRepository } from './repository.js';
import { ConflictError, InternalServerError } from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';

export async function listServices(query: ServiceListQuery) {
  const { page, pageSize, search, categoryId, isPublic } = query;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [items, total] = await servicesRepository.findManyWithCount({
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

export async function getServiceById(id: string) {
  return servicesRepository.findById(id);
}

export async function createService(authedId: string, data: CreateServiceInput) {
  const existingSlug = await servicesRepository.findBySlug(data.slug);
  const existingName = await servicesRepository.findByName(data.name);
  if (existingName || existingSlug) {
    throw new ConflictError('Service duplicate');
  }
  const service = await servicesRepository.create(data);
  if (!service) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.SERVICE,
    entityId: service.id,
  });
  return service;
}

export async function updateService(authedId: string, id: string, data: UpdateServiceInput) {
  const service = await servicesRepository.update(id, data);
  if (!service) {
    throw new InternalServerError();
  }
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.SERVICE,
    entityId: service.id,
    action: LogAction.UPDATE,
  });
  return service;
}

export async function deleteService(authedId: string, id: string) {
  const service = await servicesRepository.findById(id);
  if (!service) {
    throw new InternalServerError();
  }
  await servicesRepository.delete(id);
  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.SERVICE,
    entityId: service.id,
    action: LogAction.DELETE,
  });
}

export async function getServiceMedia(serviceId: string) {
  return servicesRepository.findMediaByServiceId(serviceId);
}

export async function attachMediaToService(
  serviceId: string,
  mediaId: string,
  orderIndex?: number
) {
  return servicesRepository.attachMediaToService({ serviceId, mediaId, orderIndex });
}

export async function updateServiceMediaOrder(
  serviceId: string,
  mediaId: string,
  orderIndex: number
) {
  return servicesRepository.updateServiceMediaOrder({ serviceId, mediaId, orderIndex });
}

export async function detachServiceMedia(serviceId: string, mediaId: string) {
  return servicesRepository.detachServiceMedia({ serviceId, mediaId });
}
