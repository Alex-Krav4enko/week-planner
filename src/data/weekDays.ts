const DAY_NAMES = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

const russianDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

const startOfWeek = getStartOfWeek(new Date());

export interface WeekDay {
  name: string;
  isoDate: string;
  dateLabel: string;
}

export const weekDays: WeekDay[] = DAY_NAMES.map((name, index) => {
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + index);
  const isoDate = toLocalISODate(date);

  return {
    name,
    isoDate,
    dateLabel: russianDateFormatter.format(date),
  };
});

export const weekTitle = `Неделя с ${weekDays[0].dateLabel} по ${weekDays[weekDays.length - 1].dateLabel}`;

export function findWeekDayByName(name?: string) {
  if (!name) {
    return undefined;
  }

  return weekDays.find((day) => day.name === name);
}

export function getTodayIsoDate() {
  return toLocalISODate(new Date());
}

export function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

