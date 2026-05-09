import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './AdminUsers.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role' },
    { key: 'created_at', label: 'Created At' },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Users Management</h1>
      {users.length === 0 ? (
        <p className={styles.empty}>No users found.</p>
      ) : (
        <Table
          columns={columns}
          data={users}
          actions={(row) => (
            <Button variant="danger" onClick={() => handleDelete(row)}>
              Delete
            </Button>
          )}
        />
      )}
    </div>
  );
}
