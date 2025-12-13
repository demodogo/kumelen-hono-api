import type { AssignServicesInput, CreateTherapistInput, UpdateTherapistInput } from './types.js';
import { therapistsRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { sanitizeTherapist } from './helpers.js';

export async function createTherapist(authedId: string, data: CreateTherapistInput) {
  if (data.email) {
    const existing = await therapistsRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Ya existe un terapeuta con este correo.');
    }
  }

  const { serviceIds, ...therapistData } = data;
  const therapist = await therapistsRepository.create(therapistData);

  if (!therapist) {
    throw new InternalServerError('Failed to create therapist.');
  }

  await therapistsRepository.assignServices(therapist.id, serviceIds);

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.THERAPIST,
    entityId: therapist.id,
  });

  const updated = await therapistsRepository.findById(therapist.id);
  return sanitizeTherapist(updated);
}

export async function getTherapistById(id: string) {
  const therapist = await therapistsRepository.findById(id);
  if (!therapist) {
    throw new NotFoundError('Therapist not found.');
  }
  return sanitizeTherapist(therapist);
}

export async function getTherapistsByService(serviceId: string) {
  const therapists = await therapistsRepository.findByServiceId(serviceId);
  return therapists.map(sanitizeTherapist);
}

export async function updateTherapist(authedId: string, id: string, data: UpdateTherapistInput) {
  const therapist = await therapistsRepository.findById(id);
  if (!therapist) throw new NotFoundError('Therapist not found.');
  if (data.email && data.email !== therapist.email) {
    const existing = await therapistsRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Ya existe un terapeuta con este correo.');
    }
  }

  const { serviceIds, ...therapistData } = data;

  const updateData = {
    ...therapistData,
    email: therapistData.email === undefined ? null : therapistData.email,
    phone: therapistData.phone === undefined ? null : therapistData.phone,
  };

  const updated = await therapistsRepository.update(id, updateData);
  if (!updated) {
    throw new InternalServerError('Failed to update therapist.');
  }

  if (serviceIds !== undefined) {
    await therapistsRepository.assignServices(id, serviceIds);
  }

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.UPDATE,
    entity: EntityType.THERAPIST,
    entityId: id,
  });

  const result = await therapistsRepository.findById(id);
  return sanitizeTherapist(result);
}

export async function deleteTherapist(authedId: string, id: string) {
  const therapist = await therapistsRepository.findById(id);
  if (!therapist) throw new NotFoundError('Therapist not found.');
  await therapistsRepository.delete(id);

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.DELETE,
    entity: EntityType.THERAPIST,
    entityId: id,
  });

  return { success: true };
}

export async function assignServicesToTherapist(
  authedId: string,
  therapistId: string,
  data: AssignServicesInput
) {
  const therapist = await therapistsRepository.findById(therapistId);
  if (!therapist) throw new NotFoundError('Therapist not found.');
  const updated = await therapistsRepository.assignServices(therapistId, data.serviceIds);
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.UPDATE,
    entity: EntityType.THERAPIST,
    entityId: therapistId,
    details: `Assigned services: ${data.serviceIds.join(', ')}`,
  });

  return sanitizeTherapist(updated);
}

export async function getAllTherapists(includeInactive = false) {
  const therapists = await therapistsRepository.findAll(includeInactive);
  return therapists.map(sanitizeTherapist);
}
