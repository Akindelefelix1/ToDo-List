const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

export function formatDueDate(value: string) {
  const due = startOfDay(new Date(value));
  const today = startOfDay();
  const difference = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  if (difference === 0) {
    return 'Today';
  }
  if (difference === 1) {
    return 'Tomorrow';
  }
  if (difference === -1) {
    return 'Yesterday';
  }
  return due.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export function isOverdue(value?: string) {
  return Boolean(value && startOfDay(new Date(value)) < startOfDay());
}
