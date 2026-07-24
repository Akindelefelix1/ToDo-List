const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
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

export function formatCreatedAt(value: string) {
  const created = new Date(value);
  const isToday = startOfDay(created).getTime() === startOfDay().getTime();
  const time = created.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) {
    return `Created today at ${time}`;
  }

  const date = created.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: created.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
  return `Created ${date} at ${time}`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isOverdue(value?: string) {
  return Boolean(value && startOfDay(new Date(value)) < startOfDay());
}
