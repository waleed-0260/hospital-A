import { format, parseISO, isValid } from "date-fns";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : new Date(value);
}

export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "—";
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "MMM d, yyyy · h:mm a") : "—";
}

export function formatMonth(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "MMM yyyy") : "—";
}

export function calcAge(dob: string): number {
  const birth = toDate(dob);
  if (!isValid(birth)) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
