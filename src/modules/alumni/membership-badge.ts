function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

export function computeMembershipBadge(payments: unknown[] = []) {
  const annualPayments = payments.filter((payment) => {
    const contribution = asRecord(asRecord(payment)?.contribution);
    const title =
      typeof contribution?.title === 'string'
        ? contribution.title.toLowerCase()
        : '';
    return contribution?.type === 'ANNUAL_FEE' || title.includes('annual');
  });

  if (annualPayments.length > 0) {
    const currentYear = new Date().getFullYear();
    const hasPaidThisYear = annualPayments.some((payment) => {
      const paymentDateValue = asRecord(payment)?.paymentDate;
      const paymentDate =
        paymentDateValue instanceof Date
          ? paymentDateValue
          : typeof paymentDateValue === 'string' ||
              typeof paymentDateValue === 'number'
            ? new Date(paymentDateValue)
            : new Date(Number.NaN);
      const paymentStatus = asRecord(payment)?.status;
      return (
        !Number.isNaN(paymentDate.getTime()) &&
        paymentDate.getFullYear() === currentYear &&
        paymentStatus === 'COMPLETED'
      );
    });

    return hasPaidThisYear ? 'ACTIVE' : 'PASSIVE';
  }

  return payments.length > 0 ? 'INACTIVE' : 'DORMANT';
}
