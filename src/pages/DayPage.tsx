import { useParams, useNavigate } from 'react-router-dom';
import DayGroup from '../DayGroup';
import styles from './DayPage.module.css';
import { findWeekDayByName } from '../data/weekDays';

export default function DayPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const decodedDay = day ? decodeURIComponent(day) : undefined;
  const currentDay = findWeekDayByName(decodedDay);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/')}>
        ← Назад
      </button>
      <DayGroup
        day={currentDay?.name ?? 'Неизвестный день'}
        date={currentDay?.dateLabel ?? 'Дата не указана'}
        isoDate={currentDay?.isoDate}
      />
    </div>
  );
}
