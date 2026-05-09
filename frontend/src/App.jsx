import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardRouter from './pages/DashboardRouter';
import ProductListing from './pages/ProductListing';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import SellerProducts from './pages/SellerProducts';
import AddProductPage from './pages/AddProductPage';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard - renders based on role */}
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* Buyer routes */}
              <Route element={<RoleRoute roles={['buyer']} />}>
                <Route path="/products" element={<ProductListing />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Route>

              {/* Seller routes */}
              <Route element={<RoleRoute roles={['seller']} />}>
                <Route path="/my-products" element={<SellerProducts />} />
                <Route path="/add-product" element={<AddProductPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<RoleRoute roles={['admin']} />}>
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/admin-products" element={<AdminProducts />} />
              </Route>
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
