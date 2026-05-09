import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './ProductListing.module.css';
import { getProductVisual } from '../utils/productVisuals';

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products');
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

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post('/wishlist', { productId });
      showToast('Added to wishlist!');
    } catch (err) {
      if (err.response?.status === 409) {
        showToast('Already in wishlist', true);
      } else {
        showToast('Failed to add to wishlist', true);
      }
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart', { productId });
      showToast('Added to cart!');
    } catch (err) {
      if (err.response?.status === 409) {
        showToast('Already in cart', true);
      } else {
        showToast('Failed to add to cart', true);
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🛍️ Products</h1>
      <div className={styles.productGrid}>
        {products.map((product) => {
          const visual = getProductVisual(product.name);
          return (
          <Card key={product.id}>
            <div className={styles.productCard}>
              <div
                className={styles.productImage}
                style={{ background: visual.gradient }}
              >
                <span className={styles.productEmoji}>{visual.emoji}</span>
              </div>
              <p className={styles.productName}>{product.name}</p>
              <p className={styles.productPrice}>₹{Number(product.price).toFixed(2)}</p>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => addToWishlist(product.id)}>
                  ❤️ Wishlist
                </Button>
                <Button onClick={() => addToCart(product.id)}>
                  🛒 Add to Cart
                </Button>
              </div>
            </div>
          </Card>
          );
        })}
      </div>
      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
