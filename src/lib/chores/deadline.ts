/** End of the current week (Sunday 23:59:59) in server time. v1 keeps this
 * simple — a household-local timezone can replace `new Date()` later. */
export function endOfWeekDeadline(now: Date = new Date()): Date {
  const deadline = new Date(now);
  const daysUntilSunday = (7 - deadline.getDay()) % 7;
  deadline.setDate(deadline.getDate() + daysUntilSunday);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}
