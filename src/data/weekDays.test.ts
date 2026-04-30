import { describe, it, expect } from 'vitest';
import {
  DAY_NAMES,
  getStartOfWeek,
  getWeekDays,
  getWeekTitle,
  toLocalISODate,
} from './weekDays';

describe('DAY_NAMES', () => {
  it('contains 7 English day names starting with Monday', () => {
    expect(DAY_NAMES).toHaveLength(7);
    expect(DAY_NAMES[0]).toBe('Monday');
    expect(DAY_NAMES[4]).toBe('Friday');
    expect(DAY_NAMES[6]).toBe('Sunday');
  });
});

describe('getStartOfWeek', () => {
  it('returns Monday when given a Wednesday', () => {
    const wednesday = new Date('2026-04-29T12:00:00');
    expect(toLocalISODate(getStartOfWeek(wednesday))).toBe('2026-04-27');
  });

  it('returns previous Monday when given a Sunday', () => {
    const sunday = new Date('2026-05-03T12:00:00');
    expect(toLocalISODate(getStartOfWeek(sunday))).toBe('2026-04-27');
  });

  it('returns same date when given a Monday', () => {
    const monday = new Date('2026-04-27T12:00:00');
    expect(toLocalISODate(getStartOfWeek(monday))).toBe('2026-04-27');
  });
});

describe('getWeekDays', () => {
  it('returns 7 days starting from the given Monday', () => {
    const monday = new Date('2026-04-27');
    const days = getWeekDays(monday);
    expect(days).toHaveLength(7);
    expect(days[0].name).toBe('Monday');
    expect(days[0].isoDate).toBe('2026-04-27');
    expect(days[6].name).toBe('Sunday');
    expect(days[6].isoDate).toBe('2026-05-03');
  });

  it('includes a non-empty dateLabel for each day', () => {
    const days = getWeekDays(new Date('2026-04-27'));
    days.forEach((day) => {
      expect(day.dateLabel.length).toBeGreaterThan(0);
    });
  });
});

describe('getWeekTitle', () => {
  it('starts with "Неделя с" and includes both boundary date labels', () => {
    const days = getWeekDays(new Date('2026-04-27'));
    const title = getWeekTitle(days);
    expect(title).toMatch(/^Неделя с /);
    expect(title).toContain(days[0].dateLabel);
    expect(title).toContain(days[6].dateLabel);
  });
});
