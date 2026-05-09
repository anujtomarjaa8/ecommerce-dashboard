import { useAuth } from '../context/AuthContext';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'seller':
      return <SellerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'buyer':
    default:
      return <BuyerDashboard />;
  }
}
