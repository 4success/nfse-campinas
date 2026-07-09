import { DateTime } from 'luxon';

export function formatDpsDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

export function formatDpsDateTime(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

export function isIsoDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return DateTime.fromISO(value, { zone: 'utc' }).isValid;
}

export function isIsoDateTime(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return DateTime.fromISO(value, { setZone: true }).isValid;
}
