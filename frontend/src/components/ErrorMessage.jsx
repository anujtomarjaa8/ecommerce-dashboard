import styles from './ErrorMessage.module.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.container}>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
