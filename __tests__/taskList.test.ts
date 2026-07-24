import type {Task} from '../src/features/tasks/types/task';
import {
  matchesTaskSearch,
  organizeTaskSections,
  sortTasks,
} from '../src/features/tasks/utils/taskList';
import {addDays, startOfDay} from '../src/utils/date';

function task(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? Math.random().toString(),
    title: 'Example task',
    completed: false,
    createdAt: new Date().toISOString(),
    source: 'typed',
    priority: 'medium',
    recurrence: 'none',
    tags: [],
    ...overrides,
  };
}

describe('task list organization', () => {
  it('groups active tasks by due state and leaves completed tasks last', () => {
    const sections = organizeTaskSections(
      [
        task({id: 'completed', completed: true}),
        task({id: 'none'}),
        task({id: 'today', dueDate: startOfDay().toISOString()}),
        task({id: 'late', dueDate: addDays(new Date(), -1).toISOString()}),
        task({id: 'next', dueDate: addDays(new Date(), 2).toISOString()}),
      ],
      'createdDesc',
    );

    expect(sections.map(section => section.key)).toEqual([
      'overdue',
      'today',
      'upcoming',
      'unscheduled',
      'completed',
    ]);
  });

  it('sorts high-priority work first', () => {
    expect(
      sortTasks(
        [
          task({id: 'low', priority: 'low'}),
          task({id: 'high', priority: 'high'}),
          task({id: 'medium', priority: 'medium'}),
        ],
        'priority',
      ).map(item => item.id),
    ).toEqual(['high', 'medium', 'low']);
  });

  it('searches metadata as well as title and description', () => {
    const item = task({
      title: 'Prepare quarterly report',
      category: 'Work',
      tags: ['finance', 'review'],
      priority: 'high',
      source: 'voice',
    });

    expect(matchesTaskSearch(item, 'work high')).toBe(true);
    expect(matchesTaskSearch(item, 'finance voice')).toBe(true);
    expect(matchesTaskSearch(item, 'shopping')).toBe(false);
  });
});
