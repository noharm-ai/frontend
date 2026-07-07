/**
 * Fixture dates are computed at request time (instead of hardcoded) so the
 * training data never looks stale or expired. Format matches the backend:
 * ISO date-time without timezone suffix.
 */
export const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

export const daysFromNow = (days: number): string => hoursFromNow(days * 24);
