import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) return <LoadingSpinner message="Loading orders..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>My Orders</h1>
        <p className={styles.emptyMessage}>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Orders</h1>
      <div className={styles.orderList}>
        {orders.map((order) => (
          <Card key={order.id}>
            <div
              className={styles.orderHeader}
              onClick={() => toggleOrder(order.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOrder(order.id); }}
            >
              <div className={styles.orderInfo}>
                <span className={styles.orderId}>Order #{order.id}</span>
                <span className={styles.orderDate}>
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className={styles.orderMeta}>
                <span className={styles.orderTotal}>₹{Number(order.total).toFixed(2)}</span>
                <span className={styles.orderStatus}>{order.status || 'completed'}</span>
                <span className={styles.expandIcon}>
                  {expandedOrder === order.id ? '▲' : '▼'}
                </span>
              </div>
            </div>
            {expandedOrder === order.id && order.items && (
              <div className={styles.orderItems}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{item.name || item.product_name || `Product #${item.product_id}`}</td>
                        <td>{item.quantity}</td>
                        <td>₹{Number(item.price_at_purchase || item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
