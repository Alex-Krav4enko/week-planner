import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './WeekPage.module.css';
import WeekNavigation from '../WeekNavigation';
import {
  getTodayIsoDate,
  getStartOfWeek,
  getWeekDays,
  getWeekTitle,
  toLocalISODate,
} from '../data/weekDays';
import { fetchEntriesSummary } from '../api/entries';

export default function WeekPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = getTodayIsoDate();

  const fromParam = searchParams.get('from');
  const weekStart = (() => {
    if (fromParam) {
      const parsed = new Date(`${fromParam}T00:00:00`);
      if (!isNaN(parsed.getTime())) {
        return getStartOfWeek(parsed);
      }
    }
    return getStartOfWeek(new Date());
  })();
  const from = toLocalISODate(weekStart);

  const weekDays = getWeekDays(weekStart);
  const weekTitle = getWeekTitle(weekDays);

  const [summary, setSummary] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const endDate = new Date(`${from}T00:00:00`);
    endDate.setDate(endDate.getDate() + 6);
    const to = toLocalISODate(endDate);

    async function loadSummary() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchEntriesSummary(from, to);
        const totals = data.reduce<Record<string, number>>((acc, item) => {
          const dateKey = item.date.includes('T')
            ? item.date.split('T')[0]
            : item.date;
          acc[dateKey] = item.totalHours;
          return acc;
        }, {});
        setSummary(totals);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, [from]);

  const shiftWeek = (days: number) => {
    const newStart = new Date(`${from}T00:00:00`);
    newStart.setDate(newStart.getDate() + days);
    setSearchParams({ from: toLocalISODate(newStart) });
  };

  return (
    <div className={styles.container}>
      <WeekNavigation
        weekTitle={weekTitle}
        onPrev={() => shiftWeek(-7)}
        onNext={() => shiftWeek(7)}
      />
      {error && (
        <div className={styles.error}>Не удалось загрузить данные: {error}</div>
      )}
      <div className={styles.dayGrid}>
        {weekDays.map((day) => (
          <div
            key={day.isoDate}
            className={`${styles.dayCard} ${day.isoDate === today ? styles.currentDay : ''}`}
            onClick={() =>
              navigate(`/day/${encodeURIComponent(day.name)}?from=${from}`)
            }
          >
            <div className={styles.dayName}>{day.name}</div>
            <div className={styles.dayDate}>{day.dateLabel}</div>
            <div className={styles.dayHours}>
              {isLoading ? '...' : `${summary[day.isoDate] ?? 0} ч`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
