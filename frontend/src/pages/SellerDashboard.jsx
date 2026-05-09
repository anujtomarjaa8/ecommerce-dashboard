import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../utils/api';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './SellerDashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/seller');
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

  const salesHistory = data?.salesHistory || [];
  const chartData = {
    labels: salesHistory.map((item) => item.date || item.month || `Sale ${item.id}`),
    datasets: [
      {
        label: 'Revenue ($)',
        data: salesHistory.map((item) => item.revenue),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Revenue' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>📦 Seller Dashboard</h1>
      <div className={styles.cardGrid}>
        <div className={`${styles.statCard} ${styles.cardProducts}`}>
          <p className={styles.statLabel}>📋 Total Products</p>
          <p className={styles.statValue}>{data?.totalProducts ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardSold}`}>
          <p className={styles.statLabel}>🎉 Products Sold</p>
          <p className={styles.statValue}>{data?.productsSold ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardRevenue}`}>
          <p className={styles.statLabel}>💰 Total Revenue</p>
          <p className={styles.statValue}>₹{data?.totalRevenue?.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>
      <div className={styles.chartSection}>
        <ChartCard title="📈 Sales Revenue">
          <Line data={chartData} options={chartOptions} />
        </ChartCard>
      </div>
    </div>
  );
}
