import styles from './ChartCard.module.css';

function ChartCard({ title, children }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default ChartCard;
