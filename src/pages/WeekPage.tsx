import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WeekPage.module.css';
import WeekNavigation from '../WeekNavigation';
import { getTodayIsoDate, weekDays, weekTitle } from '../data/weekDays';
import { fetchEntriesSummary } from '../api/entries';

export default function WeekPage() {
  const navigate = useNavigate();
  const today = getTodayIsoDate();
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setIsLoading(true);
        setError(null);
        const from = weekDays[0].isoDate;
        const to = weekDays[weekDays.length - 1].isoDate;
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
  }, []);

  return (
    <div className={styles.container}>
      <WeekNavigation weekTitle={weekTitle} />
      {error && <div className={styles.error}>Не удалось загрузить данные: {error}</div>}
      <div className={styles.dayGrid}>
        {weekDays.map((day) => (
          <div
            key={day.isoDate}
            className={`${styles.dayCard} ${day.isoDate === today ? styles.currentDay : ''}`}
            onClick={() => navigate(`/day/${encodeURIComponent(day.name)}`)}
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
