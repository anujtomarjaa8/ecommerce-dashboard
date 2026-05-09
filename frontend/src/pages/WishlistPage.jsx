import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getProductVisual } from '../utils/productVisuals';
import styles from './ProductListing.module.css';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

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

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter(item => item.product_id !== productId));
      showToast('Removed from wishlist');
    } catch (err) {
      showToast('Failed to remove item', true);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart', { productId });
      showToast('Added to cart!');
    } catch (err) {
      const message = err.response?.status === 409 ? 'Already in cart' : 'Failed to add to cart';
      showToast(message, err.response?.status !== 409);
    }
  };

  const handlePurchase = async (productId) => {
    try {
      // 1. Ensure item is in cart (ignore 409 if already there)
      try {
        await api.post('/cart', { productId });
      } catch (err) {
        if (err.response?.status !== 409) throw err;
      }

      // 2. Create the order
      await api.post('/orders');
      
      // 3. Cleanup: Remove from wishlist after successful purchase
      await api.delete(`/wishlist/${productId}`);
      
      showToast('Purchase successful!');
      fetchWishlist();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Purchase failed', true);
    }
  };

  if (loading) return <LoadingSpinner message="Loading wishlist..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchWishlist} />;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>❤️ Your Wishlist</h1>
      {items.length === 0 ? (
        <div className={styles.emptyState}>Your wishlist is empty.</div>
      ) : (
        <div className={styles.productGrid}>
          {items.map((item) => {
            const visual = getProductVisual(item.name);
            return (
              <Card key={item.id}>
                <div className={styles.productCard}>
                  <div className={styles.productImage} style={{ background: visual.gradient }}>
                    <span className={styles.productEmoji}>{visual.emoji}</span>
                  </div>
                  <p className={styles.productName}>{item.name}</p>
                  <p className={styles.productPrice}>₹{Number(item.price).toFixed(2)}</p>
                  <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Button onClick={() => addToCart(item.product_id)}>🛒 Add to Cart</Button>
                    <Button variant="primary" onClick={() => handlePurchase(item.product_id)}>⚡ Purchase Now</Button>
                    <Button variant="danger" onClick={() => removeFromWishlist(item.product_id)}>🗑️ Remove</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
