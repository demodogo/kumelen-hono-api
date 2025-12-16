import { DayOfWeek } from '@prisma/client';
import { prisma } from '../../../db/prisma.js';

export function sanitizeAppointment(appointment: any) {
  if (!appointment) return null;
  return appointment;
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  const daysMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return daysMap[dayIndex];
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function findAvailableTherapist(
  serviceId: string,
  appointmentDate: Date,
  durationMinutes: number
): Promise<string | null> {
  const dayOfWeek = getDayOfWeek(appointmentDate);
  const appointmentTime = getTimeFromDate(appointmentDate);
  const appointmentMinutes = parseTimeToMinutes(appointmentTime);
  const endMinutes = appointmentMinutes + durationMinutes;

  const therapistsWithService = await prisma.therapist.findMany({
    where: {
      isActive: true,
      services: {
        some: {
          serviceId: serviceId,
        },
      },
    },
    include: {
      schedule: {
        where: {
          dayOfWeek: dayOfWeek,
          isActive: true,
        },
      },
      appointments: {
        where: {
          appointmentDate: {
            gte: new Date(
              appointmentDate.getFullYear(),
              appointmentDate.getMonth(),
              appointmentDate.getDate()
            ),
            lt: new Date(
              appointmentDate.getFullYear(),
              appointmentDate.getMonth(),
              appointmentDate.getDate() + 1
            ),
          },
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
        },
      },
    },
  });

  for (const therapist of therapistsWithService) {
    if (therapist.schedule.length === 0) continue;

    const schedule = therapist.schedule[0];
    const scheduleStart = parseTimeToMinutes(schedule.startTime);
    const scheduleEnd = parseTimeToMinutes(schedule.endTime);

    if (appointmentMinutes < scheduleStart || endMinutes > scheduleEnd) {
      continue;
    }

    const hasConflict = therapist.appointments.some((apt) => {
      const aptStart = parseTimeToMinutes(getTimeFromDate(apt.appointmentDate));
      const aptEnd = aptStart + apt.durationMinutes;

      return (
        (appointmentMinutes >= aptStart && appointmentMinutes < aptEnd) ||
        (endMinutes > aptStart && endMinutes <= aptEnd) ||
        (appointmentMinutes <= aptStart && endMinutes >= aptEnd)
      );
    });

    if (!hasConflict) {
      return therapist.id;
    }
  }

  return null;
}

export function buildAppointmentWhere(args: {
  therapistId?: string;
  customerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { therapistId, customerId, status, startDate, endDate } = args;
  const where: any = {};

  if (therapistId) {
    where.therapistId = therapistId;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.appointmentDate = {};
    if (startDate) {
      where.appointmentDate.gte = startDate;
    }
    if (endDate) {
      where.appointmentDate.lte = endDate;
    }
  }

  return where;
}
