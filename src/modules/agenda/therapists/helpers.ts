export function sanitizeTherapist(therapist: any) {
  return {
    id: therapist.id,
    userId: therapist.userId,
    name: therapist.name,
    lastName: therapist.lastName,
    email: therapist.email,
    phone: therapist.phone,
    isActive: therapist.isActive,
    createdAt: therapist.createdAt,
    updatedAt: therapist.updatedAt,
    services: therapist.services?.map((ts: any) => ({
      id: ts.service.id,
      name: ts.service.name,
      slug: ts.service.slug,
      price: ts.service.price,
      durationMinutes: ts.service.durationMinutes,
    })),
    schedules: therapist.schedules,
    user: therapist.user,
  };
}
