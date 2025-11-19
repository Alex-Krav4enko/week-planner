import styles from './InputGroup.module.css';

export default function InputGroup() {
  return (
    <div className={styles.inputGroup}>
      <input type="text" className={styles.taskInput} placeholder="Task" />
      <input type="number" className={styles.hoursInput} placeholder="Hrs" />
    </div>
  );
}
