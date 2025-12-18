import type { CreateServiceInput, ServiceListQuery, UpdateServiceInput } from './types.js';
import { servicesRepository } from './repository.js';
import { InternalServerError, NotFoundError } from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { deleteFile, extractKeyFromUrl } from '../../../core/storage/r2-client.js';

export async function listServices(query: ServiceListQuery) {
  const { page, pageSize, search, isPublic } = query;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return await servicesRepository.findMany({
    search,
    isPublic,
    skip,
    take,
    includePrivateFields: !isPublic,
  });
}

export async function getServiceById(id: string, includePrivateFields: boolean = true) {
  return servicesRepository.findById(id, includePrivateFields);
}

export async function createService(authedId: string, data: CreateServiceInput) {
  const reactivationId = await servicesRepository.validateUniqueFields({
    name: data.name,
    slug: data.slug,
  });
  if (reactivationId) {
    const service = await servicesRepository.update(reactivationId, data);
    await appLogsRepository.createLog({
      userId: authedId,
      entity: EntityType.SERVICE,
      entityId: service.id,
      action: LogAction.UPDATE,
      details: 'Reactivación de servicio',
    });
    return service;
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
  const existing = await servicesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Servicio no encontrado');
  }

  const validationParams = {
    currentData: {
      name: existing.name,
      slug: existing.slug,
    },
    excludeId: id,
    fields: {
      name: data.name,
      slug: data.slug,
    },
  };

  await servicesRepository.validateUniqueFields(
    validationParams.fields,
    validationParams.currentData,
    validationParams.excludeId
  );

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
  const mediaFiles = await servicesRepository.findMediaByServiceId(id);
  for (const serviceMedia of mediaFiles) {
    const media = serviceMedia.media;
    if (media) {
      const key = extractKeyFromUrl(media.url);
      if (key) {
        await deleteFile(key);
      }
    }
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
