import AsyncStorage from '@react-native-async-storage/async-storage';

import type {Task} from '../types/task';

const TASKS_KEY = '@todo-list/tasks/v1';

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string'
  );
}

export async function loadTasks(): Promise<Task[]> {
  const value = await AsyncStorage.getItem(TASKS_KEY);
  if (!value) {
    return [];
  }

  const parsed: unknown = JSON.parse(value);
  return Array.isArray(parsed)
    ? parsed.filter(isTask).map(task => ({
        ...task,
        source: task.source === 'voice' ? 'voice' : 'typed',
        priority:
          task.priority === 'high' || task.priority === 'low'
            ? task.priority
            : 'medium',
        recurrence:
          task.recurrence === 'daily' ||
          task.recurrence === 'weekly' ||
          task.recurrence === 'monthly'
            ? task.recurrence
            : 'none',
        category:
          typeof task.category === 'string' && task.category.trim()
            ? task.category.trim()
            : undefined,
        tags: Array.isArray(task.tags)
          ? task.tags.filter(tag => typeof tag === 'string' && tag.trim())
          : [],
        reminderAt:
          typeof task.reminderAt === 'string' ? task.reminderAt : undefined,
      }))
    : [];
}

export function saveTasks(tasks: Task[]) {
  return AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
