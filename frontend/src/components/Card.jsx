import styles from './Card.module.css';

function Card({ children, title }) {
  return (
    <div className={styles.card}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default Card;
