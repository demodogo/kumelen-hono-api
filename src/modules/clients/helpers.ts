export function sanitizeCustomer(customer: any) {
  if (!customer) return null;
  return customer;
}

export function buildCustomerWhere(search?: string) {
  const baseWhere = { isActive: true };

  if (!search) return baseWhere;

  return {
    ...baseWhere,
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search, mode: 'insensitive' as const } },
    ],
  };
}
