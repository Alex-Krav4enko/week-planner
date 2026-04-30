export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const russianDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

export interface WeekDay {
  name: string;
  isoDate: string;
  dateLabel: string;
}

export function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getWeekDays(startDate: Date): WeekDay[] {
  return DAY_NAMES.map((name, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      name,
      isoDate: toLocalISODate(date),
      dateLabel: russianDateFormatter.format(date),
    };
  });
}

export function getWeekTitle(days: WeekDay[]): string {
  return `Неделя с ${days[0].dateLabel} по ${days[days.length - 1].dateLabel}`;
}

export function getTodayIsoDate(): string {
  return toLocalISODate(new Date());
}

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
