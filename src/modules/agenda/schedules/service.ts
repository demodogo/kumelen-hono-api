import type { CreateScheduleInput, UpdateScheduleInput } from './types.js';
import { schedulesRepository } from './repository.js';
import { InternalServerError, NotFoundError } from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { sanitizeSchedule } from './helpers.js';

export async function createSchedule(authedId: string, data: CreateScheduleInput) {
  const schedules = await schedulesRepository.createMany(data.therapistId, data.schedules);

  if (!schedules || schedules.length === 0) {
    throw new InternalServerError('Failed to create schedules.');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.THERAPIST,
    entityId: data.therapistId,
    details: `Created ${schedules.length} schedule(s)`,
  });

  return schedules.map(sanitizeSchedule);
}

export async function getScheduleById(id: string) {
  const schedule = await schedulesRepository.findById(id);
  if (!schedule) {
    throw new NotFoundError('Schedule not found.');
  }
  return sanitizeSchedule(schedule);
}

export async function getSchedulesByTherapist(therapistId: string, includeInactive = false) {
  const schedules = await schedulesRepository.findByTherapistId(therapistId, includeInactive);
  return schedules.map(sanitizeSchedule);
}

export async function updateSchedule(authedId: string, data: UpdateScheduleInput) {
  const schedules = await schedulesRepository.updateMany(data.therapistId, data.schedules);

  if (!schedules || schedules.length === 0) {
    throw new InternalServerError('Failed to update schedules.');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.UPDATE,
    entity: EntityType.THERAPIST,
    entityId: data.therapistId,
    details: `Updated ${schedules.length} schedule(s)`,
  });

  return schedules.map(sanitizeSchedule);
}

export async function deleteSchedule(authedId: string, id: string) {
  const schedule = await schedulesRepository.findById(id);
  if (!schedule) throw new NotFoundError('Schedule not found.');
  await schedulesRepository.delete(id);

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.DELETE,
    entity: EntityType.THERAPIST,
    entityId: id,
  });

  return { success: true };
}

export async function getAllSchedules(includeInactive = false) {
  const schedules = await schedulesRepository.findAll(includeInactive);
  return schedules.map(sanitizeSchedule);
}
