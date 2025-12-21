import { type AppointmentStatus, DayOfWeek, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

export const BUSINESS_TIMEZONE = 'America/Santiago';
export const DAY_START_MIN = 8 * 60 + 30;
export const DAY_END_MIN = 21 * 60;

export function sanitizeAppointment(appointment: any) {
  if (!appointment) return null;
  return appointment;
}

export function parseIsoToUtcDate(value: string): Date {
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  if (hasZone) {
    return new Date(value);
  }

  const dt = DateTime.fromISO(value, { zone: BUSINESS_TIMEZONE });
  return dt.toUTC().toJSDate();
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  const map: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return map[dayIndex];
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function toHHmm(totalMinutes: number): string {
  const mins = ((totalMinutes % 1440) + 1440) % 1440; // safe
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getDayRangeUtcFromLocalDate(dateYYYYMMDD: string): {
  dayStartUtc: Date;
  dayEndUtc: Date;
} {
  const localStart = DateTime.fromISO(dateYYYYMMDD, { zone: BUSINESS_TIMEZONE }).startOf('day');
  const localEnd = localStart.plus({ days: 1 });
  return {
    dayStartUtc: localStart.toUTC().toJSDate(),
    dayEndUtc: localEnd.toUTC().toJSDate(),
  };
}

export type Interval = { startMin: number; endMin: number };

export function clampInterval(i: Interval, min: number, max: number): Interval | null {
  const s = Math.max(i.startMin, min);
  const e = Math.min(i.endMin, max);
  if (e <= s) return null;
  return { startMin: s, endMin: e };
}

export function sortIntervals(intervals: Interval[]): Interval[] {
  return intervals.slice().sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = sortIntervals(intervals);
  const out: Interval[] = [];

  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (!last || cur.startMin > last.endMin) {
      out.push({ ...cur });
    } else {
      last.endMin = Math.max(last.endMin, cur.endMin);
    }
  }
  return out;
}

export function subtractIntervals(working: Interval[], busy: Interval[]): Interval[] {
  const w = mergeIntervals(working);
  const b = mergeIntervals(busy);

  const out: Interval[] = [];
  let j = 0;

  for (const wi of w) {
    let cursor = wi.startMin;
    while (j < b.length && b[j].endMin <= wi.startMin) j++;

    let k = j;
    while (k < b.length && b[k].startMin < wi.endMin) {
      const bi = b[k];
      if (bi.startMin > cursor) {
        out.push({ startMin: cursor, endMin: Math.min(bi.startMin, wi.endMin) });
      }
      cursor = Math.max(cursor, bi.endMin);
      if (cursor >= wi.endMin) break;
      k++;
    }
    if (cursor < wi.endMin) {
      out.push({ startMin: cursor, endMin: wi.endMin });
    }
  }
  return out;
}

export function filterByDuration(intervals: Interval[], durationMinutes: number): Interval[] {
  return intervals.filter((i) => i.endMin - i.startMin >= durationMinutes);
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function buildAppointmentsOverlapDayWhere(args: {
  therapistId?: string;
  dayStartUtc: Date;
  dayEndUtc: Date;
}) {
  const where: Prisma.AppointmentWhereInput = {
    startAt: { lt: args.dayEndUtc },
    endAt: { gt: args.dayStartUtc },
    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
  };
  if (args.therapistId) {
    where.therapistId = args.therapistId;
  }
  return where;
}

export function buildAppointmentWhere(args: {
  therapistId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const { therapistId, customerId, status, startDate, endDate } = args;
  const where: Prisma.AppointmentWhereInput = {};
  if (therapistId) where.therapistId = therapistId;
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.startAt = {};
    if (startDate) where.startAt.gte = startDate;
    if (endDate) where.startAt.lte = endDate;
  }
  return where;
}
