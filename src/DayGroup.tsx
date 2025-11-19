import { useState } from 'react';
import TicketInputGroup from './TicketInputGroup';
import styles from './DayGroup.module.css';

interface DayGroupProps {
  day: string;
  date: string;
}

interface Task {
  id: number;
  hours: number | null;
}

export default function DayGroup({ day, date }: DayGroupProps) {
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, hours: null }]);
  const [totalHours, setTotalHours] = useState(0);

  const addTask = () => {
    setTasks((prevTasks) => {
      const nextId =
        prevTasks.length > 0
          ? prevTasks[prevTasks.length - 1].id + 1
          : 1;
      const updatedTasks = [...prevTasks, { id: nextId, hours: null }];
      calculateTotalHours(updatedTasks);
      return updatedTasks;
    });
  };

  const removeTask = (id: number) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      calculateTotalHours(updatedTasks);
      return updatedTasks;
    });
  };

  const updateHours = (id: number, hours: number | null) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id ? { ...task, hours } : task,
      );
      calculateTotalHours(updatedTasks);
      return updatedTasks;
    });
  };

  const calculateTotalHours = (taskList: Task[]) => {
    const total = taskList.reduce(
      (sum, task) => sum + (task.hours ?? 0),
      0,
    );
    setTotalHours(total);
  };

  const handleCopy = (id: number) => {
    console.log(`Копирование данных для задачи с ID ${id}`);
  };

  const handleNavigate = (id: number) => {
    console.log(`Переход на страницу задачи с ID ${id}`);
  };

  return (
    <div id={day.toLowerCase()} className={styles.dayGroup}>
      <div className={styles.header}>
        <div className={styles.dayInfo}>
          <span className={styles.dayLabel}>{day}</span>
          <span className={styles.dayDate}>{date}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.totalHours}>Общее время: {totalHours} ч</span>
          <button className={styles.addTaskButton} onClick={addTask}>
            + Add Task
          </button>
        </div>
      </div>

      <div className={styles.tasks}>
        {tasks.map((task) => (
          <TicketInputGroup
            key={task.id}
            id={task.id}
            hours={task.hours}
            onCopy={handleCopy}
            onNavigate={handleNavigate}
            onRemove={removeTask}
            onUpdateHours={updateHours}
          />
        ))}
      </div>
    </div>
  );
}
