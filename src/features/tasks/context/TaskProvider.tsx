import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import {loadTasks, saveTasks} from '../services/taskStorage';
import type {NewTask, Task} from '../types/task';

type TaskAction =
  | {type: 'hydrate'; tasks: Task[]}
  | {type: 'add'; tasks: Task[]}
  | {type: 'update'; task: Task}
  | {type: 'toggle'; id: string}
  | {type: 'delete'; id: string};

type TaskContextValue = {
  tasks: Task[];
  isLoading: boolean;
  storageError: string | null;
  addTask: (task: NewTask) => Task;
  addVoiceTasks: (titles: string[]) => Task[];
  updateTask: (id: string, changes: NewTask) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

function reducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'hydrate':
      return action.tasks;
    case 'add':
      return [...action.tasks, ...state];
    case 'update':
      return state.map(task => (task.id === action.task.id ? action.task : task));
    case 'toggle':
      return state.map(task =>
        task.id === action.id ? {...task, completed: !task.completed} : task,
      );
    case 'delete':
      return state.filter(task => task.id !== action.id);
  }
}

function createTask(input: NewTask, source: Task['source'] = 'typed'): Task {
  const createdAt = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    completed: false,
    createdAt,
    dueDate: input.dueDate,
    source,
    priority: input.priority ?? 'medium',
  };
}

export function TaskProvider({children}: React.PropsWithChildren) {
  const [tasks, dispatch] = useReducer(reducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks()
      .then(storedTasks => dispatch({type: 'hydrate', tasks: storedTasks}))
      .catch(() => setStorageError('Your saved tasks could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks)
        .then(() => setStorageError(null))
        .catch(() => setStorageError('Changes could not be saved.'));
    }
  }, [isLoading, tasks]);

  const addTask = useCallback((input: NewTask) => {
    const task = createTask(input);
    dispatch({type: 'add', tasks: [task]});
    return task;
  }, []);

  const addVoiceTasks = useCallback((titles: string[]) => {
    const created = titles.map(title => createTask({title}, 'voice'));
    dispatch({type: 'add', tasks: created});
    return created;
  }, []);

  const updateTask = useCallback(
    (id: string, changes: NewTask) => {
      const existing = tasks.find(task => task.id === id);
      if (!existing) {
        return;
      }
      dispatch({
        type: 'update',
        task: {
          ...existing,
          title: changes.title.trim(),
          description: changes.description?.trim() || undefined,
          dueDate: changes.dueDate,
          priority: changes.priority ?? existing.priority,
        },
      });
    },
    [tasks],
  );

  const toggleTask = useCallback((id: string) => {
    dispatch({type: 'toggle', id});
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({type: 'delete', id});
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      storageError,
      addTask,
      addVoiceTasks,
      updateTask,
      toggleTask,
      deleteTask,
    }),
    [
      addTask,
      addVoiceTasks,
      deleteTask,
      isLoading,
      storageError,
      tasks,
      toggleTask,
      updateTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}
