import type {
  CreatePatientRecordInput,
  UpdatePatientRecordInput,
  PatientRecordListQuery,
} from './types.js';
import { patientRecordsRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { sanitizePatientRecord } from './helpers.js';
import { prisma } from '../../../db/prisma.js';

export async function listPatientRecords(query: PatientRecordListQuery) {
  const { page, pageSize, customerId, updatedById } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return await patientRecordsRepository.findMany({
    customerId,
    updatedById,
    skip,
    take,
  });
}

export async function getPatientRecordById(id: string) {
  const record = await patientRecordsRepository.findById(id);
  if (!record) {
    throw new NotFoundError('Expediente no encontrado');
  }
  return sanitizePatientRecord(record);
}

export async function getPatientRecordsByCustomer(customerId: string) {
  return await patientRecordsRepository.findByCustomerId(customerId);
}

export async function createPatientRecord(authedId: string, data: CreatePatientRecordInput) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });

  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }

  const existingRecord = await prisma.patientRecord.findUnique({
    where: { customerId: data.customerId },
  });

  if (existingRecord) {
    throw new ConflictError('Ya existe un expediente para este cliente');
  }

  const record = await patientRecordsRepository.create({
    ...data,
    updatedById: authedId,
  });

  if (!record) {
    throw new InternalServerError('Error al crear el expediente');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PATIENT_RECORD,
    entityId: record.id,
    action: LogAction.CREATE,
  });

  return sanitizePatientRecord(record);
}

export async function updatePatientRecord(
  authedId: string,
  id: string,
  data: UpdatePatientRecordInput
) {
  const existing = await patientRecordsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Expediente no encontrado');
  }

  const record = await patientRecordsRepository.update(id, data);
  if (!record) {
    throw new InternalServerError('Error al actualizar el expediente');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PATIENT_RECORD,
    entityId: record.id,
    action: LogAction.UPDATE,
  });

  return sanitizePatientRecord(record);
}

export async function deletePatientRecord(authedId: string, id: string): Promise<void> {
  const record = await patientRecordsRepository.findById(id);
  if (!record) {
    throw new NotFoundError('Expediente no encontrado');
  }

  await patientRecordsRepository.delete(id);

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.PATIENT_RECORD,
    entityId: record.id,
    action: LogAction.DELETE,
  });
}
