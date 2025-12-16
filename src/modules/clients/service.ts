import type { CreateCustomerInput, CustomerListQuery, UpdateCustomerInput } from './types.js';
import { customersRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../shared/errors/app-errors.js';
import { appLogsRepository } from '../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { sanitizeCustomer } from './helpers.js';

export async function listCustomers(query: CustomerListQuery) {
  const { page, pageSize, search } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const customers = await customersRepository.findMany({
    search,
    skip,
    take,
  });

  return customers.map((customer) => {
    const totalSessionNotes = customer.appointments.reduce(
      (sum, appointment) => sum + (appointment._count?.sessionNotes || 0),
      0
    );

    return {
      ...customer,
      appointments: undefined,
      _count: {
        ...customer._count,
        sessionNotes: totalSessionNotes,
      },
    };
  });
}

export async function getCustomerById(id: string) {
  const customer = await customersRepository.findById(id);
  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }
  return sanitizeCustomer(customer);
}

export async function createCustomer(authedId: string, data: CreateCustomerInput) {
  const reactivationId = await customersRepository.validateUniqueFields({
    email: data.email,
    phone: data.phone,
    rut: data.rut,
  });

  if (reactivationId) {
    const customer = await customersRepository.update(reactivationId, data);
    await appLogsRepository.createLog({
      userId: authedId,
      entity: EntityType.CUSTOMER,
      entityId: customer.id,
      action: LogAction.UPDATE,
      details: 'Reactivación de cliente',
    });
    return sanitizeCustomer(customer);
  }

  const customer = await customersRepository.create(data);

  if (!customer) {
    throw new InternalServerError('Error al crear el cliente');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.CUSTOMER,
    entityId: customer.id,
    action: LogAction.CREATE,
  });

  return sanitizeCustomer(customer);
}

export async function updateCustomer(authedId: string, id: string, data: UpdateCustomerInput) {
  const existing = await customersRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Cliente no encontrado');
  }

  const validationParams = {
    currentData: {
      email: existing.email,
      phone: existing.phone,
      rut: existing.rut,
    },
    excludeId: id,
    fields: {
      email: data.email,
      phone: data.phone,
      rut: data.rut,
    },
  };

  await customersRepository.validateUniqueFields(
    validationParams.fields,
    validationParams.currentData,
    validationParams.excludeId
  );

  const customer = await customersRepository.update(id, data);
  if (!customer) {
    throw new InternalServerError('Error al actualizar el cliente');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.CUSTOMER,
    entityId: customer.id,
    action: LogAction.UPDATE,
  });

  return sanitizeCustomer(customer);
}

export async function deleteCustomer(authedId: string, id: string): Promise<void> {
  const customer = await customersRepository.findById(id);
  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }

  await customersRepository.delete(id);

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.CUSTOMER,
    entityId: customer.id,
    action: LogAction.DELETE,
  });
}

export async function addCustomerPoints(authedId: string, id: string, points: number) {
  const customer = await customersRepository.findById(id);
  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }

  const updated = await customersRepository.addPoints(id, points);

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.CUSTOMER,
    entityId: customer.id,
    action: LogAction.UPDATE,
    details: `Added ${points} points`,
  });

  return sanitizeCustomer(updated);
}

export async function subtractCustomerPoints(authedId: string, id: string, points: number) {
  const customer = await customersRepository.findById(id);
  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }

  if (customer.points < points) {
    throw new ConflictError('El cliente no tiene suficientes puntos');
  }

  const updated = await customersRepository.subtractPoints(id, points);

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.CUSTOMER,
    entityId: customer.id,
    action: LogAction.UPDATE,
    details: `Subtracted ${points} points`,
  });

  return sanitizeCustomer(updated);
}
