import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './CartPage.module.css';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchased, setPurchased] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      const cartData = response.data.data;
      setItems(cartData?.items || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePurchase = async () => {
    try {
      await api.post('/orders');
      setPurchased(true);
      setItems([]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to complete purchase');
    }
  };

  if (loading) return <LoadingSpinner message="Loading cart..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCart} />;

  if (purchased) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Cart</h1>
        <div className={styles.confirmation}>
          <h2>Order Confirmed!</h2>
          <p>Your purchase was successful. Check your orders page for details.</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Cart</h1>
        <p className={styles.emptyMessage}>Your cart is empty.</p>
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'price', label: 'Price' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'lineTotal', label: 'Total' },
  ];

  const tableData = items.map((item) => ({
    id: item.id,
    name: item.name || item.product_name,
    price: `₹${Number(item.price).toFixed(2)}`,
    quantity: item.quantity,
    lineTotal: `₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}`,
  }));

  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Cart</h1>
      <Table columns={columns} data={tableData} />
      <div className={styles.totalSection}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>₹{totalPrice.toFixed(2)}</span>
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <Button onClick={handlePurchase}>Purchase</Button>
      </div>
    </div>
  );
}
