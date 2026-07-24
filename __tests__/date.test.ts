import {addDays, formatDueDate, isOverdue, startOfDay} from '../src/utils/date';

describe('date utilities', () => {
  it('formats relative due dates', () => {
    expect(formatDueDate(startOfDay().toISOString())).toBe('Today');
    expect(formatDueDate(addDays(new Date(), 1).toISOString())).toBe('Tomorrow');
  });

  it('identifies overdue dates', () => {
    expect(isOverdue(addDays(new Date(), -1).toISOString())).toBe(true);
    expect(isOverdue(addDays(new Date(), 1).toISOString())).toBe(false);
    expect(isOverdue()).toBe(false);
  });
});
