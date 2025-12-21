import type {
  AppointmentListQuery,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './types.js';
import { appointmentsRepository } from './repository.js';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../../shared/errors/app-errors.js';
import { appLogsRepository } from '../../app-logs/repository.js';
import { type DayOfWeek, EntityType, LogAction } from '@prisma/client';
import { customersRepository } from '../../clients/repository.js';
import {
  BUSINESS_TIMEZONE,
  DAY_END_MIN,
  DAY_START_MIN,
  buildAppointmentsOverlapDayWhere,
  clampInterval,
  filterByDuration,
  getDayOfWeek,
  getDayRangeUtcFromLocalDate,
  mergeIntervals,
  parseIsoToUtcDate,
  sanitizeAppointment,
  subtractIntervals,
  toHHmm,
  toMinutes,
} from './helpers.js';
import { prisma } from '../../../db/prisma.js';

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

  const startAt = parseIsoToUtcDate(data.startAt);
  if (Number.isNaN(startAt.getTime())) {
    throw new BadRequestError('startAt inválido');
  }

  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);

  let therapistId = data.therapistId;
  if (!therapistId) {
    therapistId =
      (await findAvailableTherapist({ serviceId: data.serviceId, startAt, endAt })) ?? undefined;
    if (!therapistId) {
      throw new ConflictError('No hay terapeutas disponibles para esta fecha y hora');
    }
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      therapistId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });

  if (conflict) {
    throw new ConflictError('Horario no disponible');
  }

  const appointment = await appointmentsRepository.create({
    ...data,
    customerId,
    therapistId,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
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

  const serviceId = data.serviceId ?? existing.serviceId;
  const service = await appointmentsRepository.findByServiceId(serviceId);
  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  const therapistId = data.therapistId ?? existing.therapistId ?? undefined;
  const startAt = data.startAt ? parseIsoToUtcDate(data.startAt) : existing.startAt;
  if (data.startAt && Number.isNaN(startAt.getTime())) {
    throw new BadRequestError('startAt inválido');
  }

  const mustRecomputeEndAt = data.startAt !== undefined || data.serviceId !== undefined;
  const endAt = mustRecomputeEndAt
    ? new Date(startAt.getTime() + service.durationMinutes * 60_000)
    : existing.endAt;

  if (data.startAt && therapistId) {
    const conflict = await prisma.appointment.findFirst({
      where: {
        therapistId,
        id: { not: id },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictError('Horario no disponible');
    }
  }

  const appointment = await appointmentsRepository.update(id, {
    ...data,
    ...(mustRecomputeEndAt && { endAt: endAt.toISOString() }),
  });
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

export async function findAvailableTherapist(args: {
  serviceId: string;
  startAt: Date;
  endAt: Date;
}) {
  const { serviceId, startAt, endAt } = args;
  const dayOfWeek: DayOfWeek = getDayOfWeek(startAt);

  const dayStart = new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate());
  const dayEnd = new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate() + 1);

  const therapists = await prisma.therapist.findMany({
    where: {
      isActive: true,
      services: { some: { serviceId } },
    },
    include: {
      schedule: { where: { dayOfWeek, isActive: true } },
      appointments: {
        where: {
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        select: { startAt: true, endAt: true },
      },
    },
  });

  const startMin = startAt.getHours() * 60 + startAt.getMinutes();
  const endMin = endAt.getHours() * 60 + endAt.getMinutes();

  for (const t of therapists) {
    if (t.schedule.length === 0) continue;
    const sch = t.schedule[0];
    const schStart = Math.max(toMinutes(sch.startTime), DAY_START_MIN);
    const schEnd = Math.min(toMinutes(sch.endTime), DAY_END_MIN);

    if (startMin < schStart || endMin > schEnd) continue;
    const conflict = t.appointments.some((apt) => startAt < apt.endAt && endAt > apt.startAt);
    if (!conflict) return t.id;
  }
  return null;
}

export async function checkAvailability(
  serviceId: string,
  date: string,
  durationMinutes?: number,
  therapistId?: string
) {
  const service = await appointmentsRepository.findByServiceId(serviceId);
  if (!service) {
    throw new NotFoundError('Servicio no encontrado');
  }

  const serviceDurationMinutes = durationMinutes ?? service.durationMinutes;
  const { dayStartUtc, dayEndUtc } = getDayRangeUtcFromLocalDate(date);
  const dayOfWeek = getDayOfWeek(dayStartUtc);

  const therapistWhere = therapistId
    ? { id: therapistId, isActive: true }
    : {
        isActive: true,
        services: { some: { serviceId } },
      };

  const therapists = await prisma.therapist.findMany({
    where: therapistWhere,
    include: {
      schedule: {
        where: { dayOfWeek, isActive: true },
      },
      appointments: {
        where: buildAppointmentsOverlapDayWhere({ dayStartUtc, dayEndUtc }),
        select: { startAt: true, endAt: true },
      },
    },
  });

  const allFree: { startMin: number; endMin: number }[] = [];

  for (const t of therapists) {
    if (!t.schedule?.length) continue;

    const sch = t.schedule[0];
    const clamped = clampInterval(
      { startMin: toMinutes(sch.startTime), endMin: toMinutes(sch.endTime) },
      DAY_START_MIN,
      DAY_END_MIN
    );
    if (!clamped) continue;

    const working = [clamped];

    const busy = t.appointments
      .map((a) => {
        const startLocal = a.startAt;
        const endLocal = a.endAt;
        const s = startLocal.getHours() * 60 + startLocal.getMinutes();
        const e = endLocal.getHours() * 60 + endLocal.getMinutes();
        return { startMin: s, endMin: e };
      })
      .filter((i) => i.endMin > i.startMin);

    const free = filterByDuration(
      subtractIntervals(working, mergeIntervals(busy)),
      serviceDurationMinutes
    );
    allFree.push(...free);
  }

  const merged = therapistId ? allFree : mergeIntervals(allFree);

  return {
    date,
    timezone: BUSINESS_TIMEZONE,
    serviceId,
    serviceDurationMinutes,
    freeIntervals: merged.map((i) => ({ start: toHHmm(i.startMin), end: toHHmm(i.endMin) })),
  };
}
