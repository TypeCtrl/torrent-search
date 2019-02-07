import { subHours, subMinutes } from 'date-fns';
import tk from 'timekeeper';

import { fromTimeAgo } from '../src/date';

beforeAll(() => {
  tk.freeze(new Date());
});

afterAll(() => {
  tk.reset();
});

describe('fromTimeAgo', () => {
  it('should parse date from time ago', () => {
    const date = fromTimeAgo('17h 59m ago');
    const result = subMinutes(subHours(new Date(), 17), 59);
    expect(date.toISOString()).toBe(result.toISOString());
  });
});
