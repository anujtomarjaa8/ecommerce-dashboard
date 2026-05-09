import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './ProductListing.module.css';

// Map product keywords to relevant emojis and gradient colors for visual cards
const productVisuals = [
  { keywords: ['headphone', 'earphone', 'earbuds', 'audio'], emoji: '🎧', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { keywords: ['laptop', 'macbook', 'computer', 'notebook'], emoji: '💻', gradient: 'linear-gradient(135deg, #2d3748, #4a5568)' },
  { keywords: ['backpack', 'bag', 'luggage'], emoji: '🎒', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { keywords: ['watch', 'smartwatch', 'fitness'], emoji: '⌚', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { keywords: ['shoe', 'sneaker', 'running', 'boot'], emoji: '👟', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { keywords: ['coffee', 'maker', 'espresso'], emoji: '☕', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { keywords: ['lamp', 'light', 'led'], emoji: '💡', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { keywords: ['speaker', 'bluetooth', 'sound', 'music'], emoji: '🔊', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { keywords: ['yoga', 'mat', 'fitness', 'exercise'], emoji: '🧘', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
  { keywords: ['keyboard', 'mechanical', 'typing'], emoji: '⌨️', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)' },
  { keywords: ['mouse', 'pad', 'gaming'], emoji: '🖱️', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
  { keywords: ['phone', 'mobile', 'smartphone', 'iphone'], emoji: '📱', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
  { keywords: ['camera', 'photo', 'lens'], emoji: '📷', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
  { keywords: ['book', 'reading', 'novel'], emoji: '📚', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' },
  { keywords: ['cable', 'usb', 'charger', 'wire'], emoji: '🔌', gradient: 'linear-gradient(135deg, #c1dfc4, #deecdd)' },
  { keywords: ['desk', 'stand', 'table'], emoji: '🪑', gradient: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)' },
];

function getProductVisual(productName) {
  const name = productName.toLowerCase();
  for (const visual of productVisuals) {
    if (visual.keywords.some(kw => name.includes(kw))) {
      return visual;
    }
  }
  // Default fallback
  return { emoji: '📦', gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' };
}

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
