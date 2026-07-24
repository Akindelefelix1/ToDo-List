export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
};

export type NewTask = Pick<Task, 'title'> &
  Partial<Pick<Task, 'description' | 'dueDate'>>;

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'created' | 'dueDate';
