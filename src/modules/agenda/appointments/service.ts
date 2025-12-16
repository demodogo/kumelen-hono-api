import type {
  AppointmentListQuery,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './types.js';
import { appointmentsRepository } from './repository.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { findAvailableTherapist, sanitizeAppointment } from './helpers.js';
import { customersRepository } from '../../clients/repository.js';

export async function listAppointments(query: AppointmentListQuery) {
  const { page, pageSize, therapistId, customerId, status, startDate, endDate } = query;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return appointmentsRepository.findMany({
    therapistId,
    customerId,
    status,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    skip,
    take,
  });
}

export async function getAppointmentById(id: string) {
  const appointment = await appointmentsRepository.findById(id);
  if (!appointment) {
    throw new NotFoundError('Cita no encontrada');
  }
  return sanitizeAppointment(appointment);
}

export async function createAppointment(authedId: string, data: CreateAppointmentInput) {
  const service = await appointmentsRepository.findByServiceId(data.serviceId);
  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  let customerId: string;

  if (data.customerId) {
    const existingCustomer = await customersRepository.findById(data.customerId);
    if (!existingCustomer) {
      throw new NotFoundError('Cliente no encontrado');
    }
    customerId = data.customerId;
  } else if (data.customerData) {
    const duplicates: string[] = [];

    if (data.customerData.email) {
      const existingByEmail = await customersRepository.findByEmail(data.customerData.email);
      if (existingByEmail) {
        duplicates.push(`email "${data.customerData.email}"`);
      }
    }

    if (data.customerData.phone) {
      const existingByPhone = await customersRepository.findByPhone(data.customerData.phone);
      if (existingByPhone) {
        duplicates.push(`teléfono "${data.customerData.phone}"`);
      }
    }

    if (data.customerData.rut) {
      const existingByRut = await customersRepository.findByRut(data.customerData.rut);
      if (existingByRut) {
        duplicates.push(`RUT "${data.customerData.rut}"`);
      }
    }

    if (duplicates.length > 0) {
      throw new ConflictError(
        `Ya existe un cliente con el ${duplicates.join(', ')}. Use el ID del cliente existente.`
      );
    }

    const newCustomer = await customersRepository.create({
      name: data.customerData.name,
      lastName: data.customerData.lastName,
      email: data.customerData.email,
      phone: data.customerData.phone,
      rut: data.customerData.rut,
    });

    customerId = newCustomer.id;
  } else {
    throw new BadRequestError('Debe proporcionar customerId o customerData');
  }

  const durationMinutes = data.durationMinutes || service.durationMinutes;
  const appointmentDate = new Date(data.appointmentDate);

  let therapistId = data.therapistId;

  if (!therapistId) {
    therapistId =
      (await findAvailableTherapist(data.serviceId, appointmentDate, durationMinutes)) ?? undefined;

    if (!therapistId) {
      throw new ConflictError('No hay terapeutas disponibles para esta fecha y hora');
    }
  }

  const appointment = await appointmentsRepository.create({
    ...data,
    customerId,
    therapistId,
    durationMinutes,
  });

  if (!appointment) {
    throw new InternalServerError('Error al crear la cita');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.APPOINTMENT,
    entityId: appointment.id,
    action: LogAction.CREATE,
  });

  return sanitizeAppointment(appointment);
}

export async function updateAppointment(
  authedId: string,
  id: string,
  data: UpdateAppointmentInput
) {
  const existing = await appointmentsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Cita no encontrada');
  }

  if (data.appointmentDate && data.serviceId) {
    const service = await appointmentsRepository.findByServiceId(data.serviceId);
    if (!service) {
      throw new NotFoundError('Servicio no encontrado');
    }
  }

  const appointment = await appointmentsRepository.update(id, data);
  if (!appointment) {
    throw new InternalServerError('Error al actualizar la cita');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.APPOINTMENT,
    entityId: appointment.id,
    action: LogAction.UPDATE,
  });

  return sanitizeAppointment(appointment);
}

export async function deleteAppointment(authedId: string, id: string): Promise<void> {
  const appointment = await appointmentsRepository.findById(id);
  if (!appointment) {
    throw new NotFoundError('Cita no encontrada');
  }

  await appointmentsRepository.delete(id);

  await appLogsRepository.createLog({
    userId: authedId,
    entity: EntityType.APPOINTMENT,
    entityId: appointment.id,
    action: LogAction.DELETE,
  });
}

export async function checkAvailability(serviceId: string, date: string, durationMinutes?: number) {
  const service = await appointmentsRepository.findByServiceId(serviceId);
  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  const appointmentDate = new Date(date);
  const duration = durationMinutes || service.durationMinutes;

  const availableTherapistId = await findAvailableTherapist(serviceId, appointmentDate, duration);

  return {
    available: !!availableTherapistId,
    therapistId: availableTherapistId,
    serviceId,
    date: appointmentDate,
    durationMinutes: duration,
  };
}
