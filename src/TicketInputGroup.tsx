import { ChangeEvent, useEffect, useState } from 'react';
import { FaCopy, FaExternalLinkAlt, FaTrashAlt, FaCheck } from 'react-icons/fa';
import styles from './TicketInputGroup.module.css';

interface TicketInputGroupProps {
  id: number;
  hours: number | null;
  onCopy: (id: number) => void;
  onNavigate: (id: number) => void;
  onRemove: (id: number) => void;
  onUpdateHours: (id: number, hours: number | null) => void;
}

export default function TicketInputGroup({
  id,
  hours,
  onCopy,
  onNavigate,
  onRemove,
  onUpdateHours,
}: TicketInputGroupProps) {
  const [copied, setCopied] = useState(false);
  const [hoursValue, setHoursValue] = useState(hours?.toString() ?? '');

  useEffect(() => {
    setHoursValue(hours?.toString() ?? '');
  }, [hours]);

  const handleCopy = () => {
    setCopied(!copied);
    onCopy(id);
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setHoursValue(value);

    const parsedValue = value === '' ? null : Number(value);
    onUpdateHours(id, Number.isNaN(parsedValue) ? null : parsedValue);
  };

  return (
    <div className={`${styles.ticketGroup} ${copied ? styles.copied : ''}`}>
      <div className={styles.row}>
        <div className={styles.ticketDisplay}>Тикет</div>
        <input type="url" placeholder="Ссылка" className={styles.linkInput} />
        <input
          type="number"
          placeholder="Часы"
          className={styles.hoursInput}
          value={hoursValue}
          onChange={handleHoursChange}
        />
        <div className={styles.buttons}>
          <button className={styles.iconButton} onClick={handleCopy}>
            {copied ? <FaCheck className={styles.copiedIcon} /> : <FaCopy />}
          </button>
          <button className={styles.iconButton} onClick={() => onNavigate(id)}>
            <FaExternalLinkAlt />
          </button>
          <button className={styles.iconButton} onClick={() => onRemove(id)}>
            <FaTrashAlt />
          </button>
        </div>
      </div>
      <div className={styles.column}>
        <input
          type="text"
          placeholder="Название"
          className={styles.titleInput}
        />
        <input placeholder="Описание" className={styles.descriptionInput} />
      </div>
    </div>
  );
}
