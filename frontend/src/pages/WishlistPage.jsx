import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/wishlist');
      setItems(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove item');
    }
  };

  if (loading) return <LoadingSpinner message="Loading wishlist..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchWishlist} />;

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>My Wishlist</h1>
        <p className={styles.emptyMessage}>Your wishlist is empty.</p>
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
  ];

  const tableData = items.map((item) => ({
    id: item.product_id || item.id,
    name: item.name || item.product_name,
    price: `₹${Number(item.price).toFixed(2)}`,
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Wishlist</h1>
      <Table
        columns={columns}
        data={tableData}
        actions={(row) => (
          <Button variant="danger" onClick={() => removeItem(row.id)}>
            Remove
          </Button>
        )}
      />
    </div>
  );
}
