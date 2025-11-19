import { useNavigate } from 'react-router-dom';
import styles from './WeekPage.module.css';
import WeekNavigation from '../WeekNavigation';
import { getTodayIsoDate, weekDays, weekTitle } from '../data/weekDays';

export default function WeekPage() {
  const navigate = useNavigate();
  const today = getTodayIsoDate();

  return (
    <div className={styles.container}>
      <WeekNavigation weekTitle={weekTitle} />
      <div className={styles.dayGrid}>
        {weekDays.map((day) => (
          <div
            key={day.isoDate}
            className={`${styles.dayCard} ${day.isoDate === today ? styles.currentDay : ''}`}
            onClick={() => navigate(`/day/${encodeURIComponent(day.name)}`)}
          >
            <div className={styles.dayName}>{day.name}</div>
            <div className={styles.dayDate}>{day.dateLabel}</div>
            <div className={styles.dayHours}>{day.plannedHours} ч</div>
          </div>
        ))}
      </div>
    </div>
  );
}
