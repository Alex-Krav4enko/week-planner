import { ChangeEvent, useEffect, useState } from 'react';
import { FaCopy, FaExternalLinkAlt, FaTrashAlt, FaCheck } from 'react-icons/fa';
import styles from './TicketInputGroup.module.css';

interface TicketInputGroupProps {
  title: string;
  link: string;
  description: string;
  hours: number | null;
  isSaving: boolean;
  error: string | null;
  canSave: boolean;
  onTitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onLinkBlur?: () => void;
  onDescriptionChange: (value: string) => void;
  onCopy: () => void;
  onNavigate: () => void;
  onRemove: () => void;
  onSave: () => void;
  onUpdateHours: (hours: number | null) => void;
}

export default function TicketInputGroup({
  title,
  link,
  description,
  hours,
  isSaving,
  error,
  canSave,
  onTitleChange,
  onLinkChange,
  onLinkBlur,
  onDescriptionChange,
  onCopy,
  onNavigate,
  onRemove,
  onSave,
  onUpdateHours,
}: TicketInputGroupProps) {
  const [copied, setCopied] = useState(false);
  const [hoursValue, setHoursValue] = useState(hours?.toString() ?? '');

  useEffect(() => {
    setHoursValue(hours?.toString() ?? '');
  }, [hours]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === '') {
      setHoursValue('');
      onUpdateHours(null);
      return;
    }

    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      return;
    }

    setHoursValue(value);
    onUpdateHours(parsedValue);
  };

  return (
    <div className={`${styles.ticketGroup} ${copied ? styles.copied : ''}`}>
      <div className={styles.row}>
        <div className={styles.ticketDisplay}>Тикет</div>
        <input
          type="url"
          placeholder="Ссылка"
          className={styles.linkInput}
          value={link}
          onChange={(event) => onLinkChange(event.target.value)}
          onBlur={onLinkBlur}
        />
        <input
          type="number"
          placeholder="Часы"
          className={styles.hoursInput}
          min={0}
          value={hoursValue}
          onChange={handleHoursChange}
        />
        <div className={styles.buttons}>
          <button
            className={styles.saveButton}
            onClick={onSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? '...' : 'Сохранить'}
          </button>
          <button className={styles.iconButton} onClick={handleCopy}>
            {copied ? <FaCheck className={styles.copiedIcon} /> : <FaCopy />}
          </button>
          <button className={styles.iconButton} onClick={onNavigate}>
            <FaExternalLinkAlt />
          </button>
          <button className={styles.iconButton} onClick={onRemove}>
            <FaTrashAlt />
          </button>
        </div>
      </div>
      <div className={styles.column}>
        <input
          type="text"
          placeholder="Название"
          className={styles.titleInput}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <input
          placeholder="Описание"
          className={styles.descriptionInput}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
