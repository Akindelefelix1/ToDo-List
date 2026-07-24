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
  | {type: 'toggle'; id: string}
  | {type: 'delete'; id: string};

type TaskContextValue = {
  tasks: Task[];
  isLoading: boolean;
  storageError: string | null;
  addTask: (task: NewTask) => Task;
  addTasks: (titles: string[]) => Task[];
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
    case 'toggle':
      return state.map(task =>
        task.id === action.id ? {...task, completed: !task.completed} : task,
      );
    case 'delete':
      return state.filter(task => task.id !== action.id);
  }
}

function createTask(input: NewTask): Task {
  const createdAt = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    completed: false,
    createdAt,
    dueDate: input.dueDate,
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

  const addTasks = useCallback((titles: string[]) => {
    const created = titles.map(title => createTask({title}));
    dispatch({type: 'add', tasks: created});
    return created;
  }, []);

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
      addTasks,
      toggleTask,
      deleteTask,
    }),
    [addTask, addTasks, deleteTask, isLoading, storageError, tasks, toggleTask],
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
