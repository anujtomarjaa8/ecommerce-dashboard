import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './AdminProducts.module.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRemove = async (product) => {
    if (!window.confirm(`Are you sure you want to remove product "${product.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/products/${product.id}`);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove product');
    }
  };

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'seller', label: 'Seller' },
    { key: 'price', label: 'Price' },
    { key: 'status', label: 'Status' },
  ];

  const tableData = products.map((p) => ({
    ...p,
    price: `₹${Number(p.price).toFixed(2)}`,
    seller: p.seller_name || p.seller || 'Unknown',
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Products Management</h1>
      {products.length === 0 ? (
        <p className={styles.empty}>No products found.</p>
      ) : (
        <Table
          columns={columns}
          data={tableData}
          actions={(row) => (
            <Button variant="danger" onClick={() => handleRemove(row)}>
              Remove
            </Button>
          )}
        />
      )}
    </div>
  );
}
