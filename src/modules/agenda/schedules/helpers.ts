export function sanitizeSchedule(schedule: any) {
  return {
    id: schedule.id,
    therapistId: schedule.therapistId,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    isActive: schedule.isActive,
    therapist: schedule.therapist,
  };
}
