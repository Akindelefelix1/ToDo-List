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
import {addDays, addMonths} from '../../../utils/date';
import type {NewTask, Task} from '../types/task';

export type ToggleTaskResult = {
  taskId: string;
  generatedTask?: Task;
};

type TaskAction =
  | {type: 'hydrate'; tasks: Task[]}
  | {type: 'add'; tasks: Task[]}
  | {type: 'update'; task: Task}
  | {type: 'restore'; task: Task}
  | {type: 'toggle'; id: string}
  | {type: 'completeRecurring'; task: Task; nextTask: Task}
  | {type: 'undoToggle'; result: ToggleTaskResult}
  | {type: 'delete'; id: string};

type TaskContextValue = {
  tasks: Task[];
  isLoading: boolean;
  storageError: string | null;
  addTask: (task: NewTask) => Task;
  addVoiceTasks: (titles: string[]) => Task[];
  updateTask: (id: string, changes: NewTask) => void;
  toggleTask: (id: string) => ToggleTaskResult | null;
  undoToggleTask: (result: ToggleTaskResult) => void;
  deleteTask: (id: string) => Task | null;
  restoreTask: (task: Task) => void;
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
    case 'restore':
      return state.some(task => task.id === action.task.id)
        ? state
        : [action.task, ...state];
    case 'toggle':
      return state.map(task =>
        task.id === action.id ? {...task, completed: !task.completed} : task,
      );
    case 'delete':
      return state.filter(task => task.id !== action.id);
    case 'completeRecurring':
      return [
        action.nextTask,
        ...state.map(task =>
          task.id === action.task.id ? action.task : task,
        ),
      ];
    case 'undoToggle':
      return state
        .filter(task => task.id !== action.result.generatedTask?.id)
        .map(task =>
          task.id === action.result.taskId
            ? {...task, completed: !task.completed}
            : task,
        );
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
    reminderAt: input.reminderAt,
    recurrence: input.recurrence ?? 'none',
    category: input.category?.trim() || undefined,
    tags: input.tags ?? [],
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
          reminderAt: changes.reminderAt,
          recurrence: changes.recurrence ?? existing.recurrence,
          category: changes.category?.trim() || undefined,
          tags: changes.tags ?? existing.tags,
        },
      });
    },
    [tasks],
  );

  const toggleTask = useCallback(
    (id: string): ToggleTaskResult | null => {
      const existing = tasks.find(task => task.id === id);
      if (!existing) {
        return null;
      }

      if (!existing.completed && existing.recurrence !== 'none') {
        const advance = (value?: string) => {
          if (!value) {
            return undefined;
          }
          const date = new Date(value);
          if (existing.recurrence === 'daily') {
            return addDays(date, 1).toISOString();
          }
          if (existing.recurrence === 'weekly') {
            return addDays(date, 7).toISOString();
          }
          return addMonths(date, 1).toISOString();
        };
        const nextTask: Task = {
          ...existing,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate: advance(existing.dueDate),
          reminderAt: advance(existing.reminderAt),
        };
        dispatch({
          type: 'completeRecurring',
          task: {...existing, completed: true},
          nextTask,
        });
        return {taskId: id, generatedTask: nextTask};
      }

      dispatch({type: 'toggle', id});
      return {taskId: id};
    },
    [tasks],
  );

  const undoToggleTask = useCallback((result: ToggleTaskResult) => {
    dispatch({type: 'undoToggle', result});
  }, []);

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find(item => item.id === id) ?? null;
      if (!task) {
        return null;
      }
      dispatch({type: 'delete', id});
      return task;
    },
    [tasks],
  );

  const restoreTask = useCallback((task: Task) => {
    dispatch({type: 'restore', task});
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
      undoToggleTask,
      deleteTask,
      restoreTask,
    }),
    [
      addTask,
      addVoiceTasks,
      deleteTask,
      isLoading,
      storageError,
      tasks,
      toggleTask,
      undoToggleTask,
      updateTask,
      restoreTask,
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
