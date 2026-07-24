import {splitVoiceTasks} from '../src/utils/splitVoiceTasks';

describe('splitVoiceTasks', () => {
  it('splits explicit natural-language connectors', () => {
    expect(
      splitVoiceTasks('Buy provisions and then call mom, also send the report'),
    ).toEqual(['Buy provisions', 'call mom', 'send the report']);
  });

  it('splits two clear actions joined by and', () => {
    expect(splitVoiceTasks('Buy provisions and call mom')).toEqual([
      'Buy provisions',
      'call mom',
    ]);
  });

  it('does not split a noun phrase', () => {
    expect(splitVoiceTasks('Buy bread and milk')).toEqual(['Buy bread and milk']);
  });

  it('removes common dictation prefixes and duplicate whitespace', () => {
    expect(splitVoiceTasks('Please add   review the pull request.')).toEqual([
      'review the pull request',
    ]);
  });

  it('returns no tasks for blank speech', () => {
    expect(splitVoiceTasks('   ')).toEqual([]);
  });
});
