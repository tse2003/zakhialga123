const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;

export function cleanText(value: unknown) {
  return String(value ?? '').trim();
}

export function validatePhone(value: string, required = true) {
  if (!value) return !required;
  return PHONE_PATTERN.test(value);
}

export function parseDate(value: unknown) {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? null : date;
}

