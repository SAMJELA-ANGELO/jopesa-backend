export function normalizeCameroonPhone(value?: string | null) {
  let digits = (value || '').replace(/\D/g, '');
  if (digits.startsWith('237') && digits.length === 12) digits = digits.slice(3);
  return digits;
}

export function isValidCameroonPhone(value: string) {
  return /^6\d{8}$/.test(value);
}