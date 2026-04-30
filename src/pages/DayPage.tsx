import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DayGroup from '../DayGroup';
import styles from './DayPage.module.css';
import {
  DAY_NAMES,
  getStartOfWeek,
  toLocalISODate,
} from '../data/weekDays';

const russianDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

export default function DayPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const decodedDay = day ? decodeURIComponent(day) : undefined;
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

  const dayIndex = decodedDay ? DAY_NAMES.indexOf(decodedDay) : -1;

  let isoDate: string | undefined;
  let dateLabel: string | undefined;

  if (dayIndex >= 0) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    isoDate = toLocalISODate(date);
    dateLabel = russianDateFormatter.format(date);
  }

  const backUrl = fromParam ? `/?from=${fromParam}` : '/';

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(backUrl)}>
        ← Назад
      </button>
      <DayGroup
        day={decodedDay ?? 'Неизвестный день'}
        date={dateLabel ?? 'Дата не указана'}
        isoDate={isoDate}
      />
    </div>
  );
}
