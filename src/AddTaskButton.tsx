import styles from './AddTaskButton.module.css';
import React from 'react';

interface AddTaskButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <button onClick={onClick} className={styles.addTaskButton}>
      + Add another task
    </button>
  );
}
