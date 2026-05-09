import styles from './FormInput.module.css';

function FormInput({ label, id, type = 'text', value, onChange, error, required = false, placeholder, options }) {
  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={id}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options && options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
        />
      );
    }

    return (
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {renderInput()}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default FormInput;
