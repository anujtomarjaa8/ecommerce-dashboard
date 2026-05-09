import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../utils/api';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './AdminDashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dashboard/admin');
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

  const userRegistrations = data?.userRegistrations || [];
  const userChartData = {
    labels: userRegistrations.map((item) => item.date || item.month),
    datasets: [
      {
        label: 'New Users',
        data: userRegistrations.map((item) => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const userChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'User Registrations' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const orderVolume = data?.orderVolume || [];
  const orderChartData = {
    labels: orderVolume.map((item) => item.date || item.month),
    datasets: [
      {
        label: 'Orders',
        data: orderVolume.map((item) => item.count),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const orderChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Order Volume' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>⚙️ Admin Dashboard</h1>
      <div className={styles.cardGrid}>
        <div className={`${styles.statCard} ${styles.cardUsers}`}>
          <p className={styles.statLabel}>👥 Total Users</p>
          <p className={styles.statValue}>{data?.totalUsers ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardProducts}`}>
          <p className={styles.statLabel}>📦 Total Products</p>
          <p className={styles.statValue}>{data?.totalProducts ?? 0}</p>
        </div>
        <div className={`${styles.statCard} ${styles.cardOrders}`}>
          <p className={styles.statLabel}>🧾 Total Orders</p>
          <p className={styles.statValue}>{data?.totalOrders ?? 0}</p>
        </div>
      </div>
      <div className={styles.chartSection}>
        <div className={styles.chartGrid}>
          <ChartCard title="👥 User Registrations">
            <Bar data={userChartData} options={userChartOptions} />
          </ChartCard>
          <ChartCard title="📊 Order Volume">
            <Line data={orderChartData} options={orderChartOptions} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
