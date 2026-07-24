import {
  formatCreatedAt,
  formatDueDate,
  isOverdue,
  startOfDay,
} from '../../../utils/date';
import type {
  Task,
  TaskSectionKey,
  TaskSort,
} from '../types/task';

export type TaskSection = {
  key: TaskSectionKey;
  title: string;
  data: Task[];
};

const sectionTitles: Record<TaskSectionKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  unscheduled: 'No due date',
  completed: 'Completed',
};

const priorityRank = {high: 0, medium: 1, low: 2} as const;

export function sortTasks(tasks: Task[], sort: TaskSort) {
  return [...tasks].sort((left, right) => {
    if (sort === 'priority') {
      return (
        priorityRank[left.priority] - priorityRank[right.priority] ||
        right.createdAt.localeCompare(left.createdAt)
      );
    }
    if (sort === 'dueDate') {
      if (!left.dueDate) {
        return 1;
      }
      if (!right.dueDate) {
        return -1;
      }
      return left.dueDate.localeCompare(right.dueDate);
    }
    return sort === 'createdAsc'
      ? left.createdAt.localeCompare(right.createdAt)
      : right.createdAt.localeCompare(left.createdAt);
  });
}

export function organizeTaskSections(
  tasks: Task[],
  sort: TaskSort,
): TaskSection[] {
  const today = startOfDay().getTime();
  const grouped: Record<TaskSectionKey, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    unscheduled: [],
    completed: [],
  };

  tasks.forEach(task => {
    if (task.completed) {
      grouped.completed.push(task);
    } else if (!task.dueDate) {
      grouped.unscheduled.push(task);
    } else if (isOverdue(task.dueDate)) {
      grouped.overdue.push(task);
    } else if (startOfDay(new Date(task.dueDate)).getTime() === today) {
      grouped.today.push(task);
    } else {
      grouped.upcoming.push(task);
    }
  });

  return (
    ['overdue', 'today', 'upcoming', 'unscheduled', 'completed'] as const
  )
    .map(key => ({
      key,
      title: sectionTitles[key],
      data: sortTasks(grouped[key], sort),
    }))
    .filter(section => section.data.length > 0);
}

export function matchesTaskSearch(task: Task, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const searchable = [
    task.title,
    task.description,
    task.category,
    ...task.tags,
    task.priority,
    task.source,
    task.recurrence === 'none' ? undefined : task.recurrence,
    task.completed ? 'completed done finished' : 'active incomplete pending',
    task.dueDate ? formatDueDate(task.dueDate) : 'no due date unscheduled',
    formatCreatedAt(task.createdAt),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return normalized
    .split(/\s+/)
    .every(term => searchable.includes(term));
}
