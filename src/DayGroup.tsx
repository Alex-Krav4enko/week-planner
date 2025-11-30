import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  createEntry,
  deleteEntry,
  fetchEntriesByDate,
  updateEntry,
} from './api/entries';
import { createTask, fetchTasks, updateTask } from './api/tasks';
import TicketInputGroup from './TicketInputGroup';
import styles from './DayGroup.module.css';
import { Entry, Task } from './api/types';

interface DayGroupProps {
  day: string;
  date: string;
  isoDate?: string;
}

const generateLocalId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ticket-${Math.random().toString(36).slice(2, 9)}`;

interface TicketState {
  localId: string;
  entryId?: string;
  taskId?: string;
  title: string;
  link: string;
  description: string;
  hours: number | null;
  isSaving: boolean;
  error: string | null;
}

function mapEntryToTicket(entry: Entry): TicketState {
  return {
    localId: entry.id,
    entryId: entry.id,
    taskId: entry.task.id,
    title: entry.task.title,
    link: entry.task.link,
    description: entry.description ?? '',
    hours: entry.hours ?? 0,
    isSaving: false,
    error: null,
  };
}

export default function DayGroup({ day, date, isoDate }: DayGroupProps) {
  const [tickets, setTickets] = useState<TicketState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isoDate) {
      return;
    }

    const dateForRequest = isoDate;

    async function loadEntries() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const entries = await fetchEntriesByDate(dateForRequest);
        setTickets(entries.map(mapEntryToTicket));
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : 'Не удалось загрузить задачи',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, [isoDate]);

  const totalHours = useMemo(
    () =>
      tickets.reduce((sum, ticket) => sum + (ticket.hours ?? 0), 0),
    [tickets],
  );

  const addTask = () => {
    setTickets((prev) => [
      ...prev,
      {
        localId: generateLocalId(),
        title: '',
        link: '',
        description: '',
        hours: null,
        isSaving: false,
        error: null,
      },
    ]);
  };

  const updateTicket = (
    localId: string,
    updates: Partial<TicketState>,
  ) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.localId === localId ? { ...ticket, ...updates } : ticket,
      ),
    );
  };

  const findMatchingTask = async (
    localId: string,
  ): Promise<Task | undefined> => {
    const ticket = tickets.find((item) => item.localId === localId);
    if (!ticket) {
      return undefined;
    }

    const searchValue = ticket.link?.trim() || ticket.title.trim();
    if (!searchValue) {
      return undefined;
    }

    const candidates = await fetchTasks(searchValue);
    if (!candidates.length) {
      return undefined;
    }

    const matchedTask =
      ticket.link
        ? candidates.find((task) => task.link === ticket.link) ?? candidates[0]
        : candidates[0];

    updateTicket(localId, {
      taskId: matchedTask.id,
      title: matchedTask.title,
      link: matchedTask.link,
      error: null,
    });

    return matchedTask;
  };

  const handleLinkLookup = async (localId: string) => {
    try {
      await findMatchingTask(localId);
    } catch (err) {
      updateTicket(localId, {
        error:
          err instanceof Error
            ? err.message
            : 'Не удалось найти существующий тикет',
      });
    }
  };

  const removeTicket = async (localId: string) => {
    const ticket = tickets.find((item) => item.localId === localId);
    if (!ticket) {
      return;
    }

    if (!ticket.entryId) {
      setTickets((prev) => prev.filter((item) => item.localId !== localId));
      return;
    }

    updateTicket(localId, { isSaving: true, error: null });
    try {
      await deleteEntry(ticket.entryId);
      setTickets((prev) => prev.filter((item) => item.localId !== localId));
    } catch (err) {
      updateTicket(localId, {
        error: err instanceof Error ? err.message : 'Не удалось удалить запись',
      });
      updateTicket(localId, { isSaving: false });
    }
  };

  const handleCopy = async (localId: string) => {
    const ticket = tickets.find((item) => item.localId === localId);
    if (!ticket?.link) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(ticket.link);
    } catch {
      // Игнорируем ошибки (например, отсутствие разрешений)
    }
  };

  const handleNavigate = (localId: string) => {
    const ticket = tickets.find((item) => item.localId === localId);
    if (ticket?.link) {
      window.open(ticket.link, '_blank');
    }
  };

  const handleSave = async (localId: string) => {
    if (!isoDate) {
      updateTicket(localId, { error: 'Дата недоступна' });
      return;
    }

    const ticket = tickets.find((item) => item.localId === localId);
    if (!ticket) {
      return;
    }

    updateTicket(localId, { isSaving: true, error: null });

    try {
      let taskId = ticket.taskId;

      if (!taskId) {
        const existingTask = await findMatchingTask(localId);
        if (existingTask) {
          taskId = existingTask.id;
        }
      }

      if (!taskId) {
        try {
          const task = await createTask({
            title: ticket.title,
            link: ticket.link,
          });
          taskId = task.id;
          updateTicket(localId, {
            taskId: task.id,
            title: task.title,
            link: task.link,
          });
        } catch (taskError) {
          if (isAxiosError(taskError) && taskError.response?.status === 409) {
            const existingTask = await findMatchingTask(localId);
            if (existingTask) {
              taskId = existingTask.id;
            } else {
              throw taskError;
            }
          } else {
            throw taskError;
          }
        }
      }

      if (!taskId) {
        updateTicket(localId, {
          error: 'Не удалось определить задачу',
        });
        return;
      }

      if (ticket.taskId) {
        await updateTask(taskId, {
          title: ticket.title,
          link: ticket.link,
        });
      }

      let savedEntry: Entry;
      if (ticket.entryId) {
        savedEntry = await updateEntry(ticket.entryId, {
          taskId,
          date: isoDate,
          hours: ticket.hours ?? 0,
          description: ticket.description,
        });
      } else {
        savedEntry = await createEntry({
          taskId,
          date: isoDate,
          hours: ticket.hours ?? 0,
          description: ticket.description,
        });
      }

      updateTicket(localId, {
        ...mapEntryToTicket(savedEntry),
        localId,
      });
    } catch (err) {
      updateTicket(localId, {
        error: err instanceof Error ? err.message : 'Не удалось сохранить',
      });
    } finally {
      updateTicket(localId, { isSaving: false });
    }
  };

  const canSaveTicket = (ticket: TicketState) =>
    Boolean(ticket.title && ticket.link);

  return (
    <div id={day.toLowerCase()} className={styles.dayGroup}>
      <div className={styles.header}>
        <div className={styles.dayInfo}>
          <span className={styles.dayLabel}>{day}</span>
          <span className={styles.dayDate}>{date}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.totalHours}>Общее время: {totalHours} ч</span>
          <button
            className={styles.addTaskButton}
            onClick={addTask}
            disabled={!isoDate}
          >
            + Add Task
          </button>
        </div>
      </div>

      {loadError && (
        <div className={styles.error}>
          Не удалось загрузить задачи: {loadError}
        </div>
      )}

      <div className={styles.tasks}>
        {tickets.map((ticket) => (
          <TicketInputGroup
            key={ticket.localId}
            title={ticket.title}
            link={ticket.link}
            description={ticket.description}
            hours={ticket.hours}
            isSaving={ticket.isSaving}
            error={ticket.error}
            canSave={canSaveTicket(ticket)}
            onTitleChange={(value) =>
              updateTicket(ticket.localId, { title: value })
            }
            onLinkChange={(value) =>
              updateTicket(ticket.localId, { link: value })
            }
            onLinkBlur={() => handleLinkLookup(ticket.localId)}
            onDescriptionChange={(value) =>
              updateTicket(ticket.localId, { description: value })
            }
            onUpdateHours={(value) =>
              updateTicket(ticket.localId, { hours: value })
            }
            onCopy={() => handleCopy(ticket.localId)}
            onNavigate={() => handleNavigate(ticket.localId)}
            onRemove={() => removeTicket(ticket.localId)}
            onSave={() => handleSave(ticket.localId)}
          />
        ))}
      </div>

      {isLoading && <div className={styles.loading}>Загрузка...</div>}
    </div>
  );
}
