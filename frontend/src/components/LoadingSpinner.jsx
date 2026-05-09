import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message }) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
