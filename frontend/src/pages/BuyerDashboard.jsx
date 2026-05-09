import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../utils/api';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './BuyerDashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function BuyerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/buyer');
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />;

  const orderHistory = data?.orderHistory || [];
  const chartData = {
    labels: orderHistory.map((item) => item.date || item.month || `Order ${item.id}`),
    datasets: [
      {
        label: 'Orders',
        data: orderHistory.map((item) => item.count || item.total),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🛒 Buyer Dashboard</h1>
      <div className={styles.cardGrid}>
        <div className={`${styles.statCard} ${styles.cardWishlist}`}>
          <p className={styles.statLabel}>❤️ Wishlist Items</p>
          <p className={styles.statValue}>{data?.wishlistCount ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardCart}`}>
          <p className={styles.statLabel}>🛍️ Cart Items</p>
          <p className={styles.statValue}>{data?.cartCount ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardOrders}`}>
          <p className={styles.statLabel}>📦 Past Orders</p>
          <p className={styles.statValue}>{data?.ordersCount ?? 0}</p>
        </div>
      </div>
      <div className={styles.chartSection}>
        <ChartCard title="📊 Order History">
          <Bar data={chartData} options={chartOptions} />
        </ChartCard>
      </div>
    </div>
  );
}
