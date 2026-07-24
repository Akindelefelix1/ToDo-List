export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  source: 'typed' | 'voice';
  priority: TaskPriority;
  reminderAt?: string;
  recurrence: TaskRecurrence;
  category?: string;
  tags: string[];
};

export type NewTask = Pick<Task, 'title'> &
  Partial<
    Pick<
      Task,
      | 'description'
      | 'dueDate'
      | 'priority'
      | 'reminderAt'
      | 'recurrence'
      | 'category'
      | 'tags'
    >
  >;

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'priority' | 'dueDate' | 'createdDesc' | 'createdAsc';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskViewMode = 'cards' | 'table';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type TaskSectionKey =
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'unscheduled'
  | 'completed';
