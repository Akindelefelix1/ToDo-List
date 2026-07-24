export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  source: 'typed' | 'voice';
  priority: TaskPriority;
};

export type NewTask = Pick<Task, 'title'> &
  Partial<Pick<Task, 'description' | 'dueDate' | 'priority'>>;

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'created' | 'dueDate';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskViewMode = 'cards' | 'table';
