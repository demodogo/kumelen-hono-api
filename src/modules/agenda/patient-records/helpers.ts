export function sanitizePatientRecord(record: any) {
  if (!record) return null;
  return record;
}

export function buildPatientRecordWhere(args: { customerId?: string; updatedById?: string }) {
  const { customerId, updatedById } = args;
  const where: any = {};

  if (customerId) {
    where.customerId = customerId;
  }

  if (updatedById) {
    where.updatedById = updatedById;
  }

  return where;
}
