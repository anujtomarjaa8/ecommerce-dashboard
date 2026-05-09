import styles from './Button.module.css';

function Button({ children, variant = 'primary', onClick, disabled = false, type = 'button' }) {
  const className = `${styles.button} ${styles[variant] || ''}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

export default Button;
