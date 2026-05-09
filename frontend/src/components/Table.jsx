import styles from './Table.module.css';

function Table({ columns, data, actions }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.label}
              </th>
            ))}
            {actions && <th className={styles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className={styles.tr}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {row[col.key]}
                </td>
              ))}
              {actions && (
                <td className={styles.td}>{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
