/**
 * Parse a YYYY-MM-DD date string as a local date (not UTC).
 * This avoids timezone issues where "2026-01-25" becomes Jan 24 in UTC-3.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string to short Portuguese format (e.g., "25 jan. 2026")
 */
export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
