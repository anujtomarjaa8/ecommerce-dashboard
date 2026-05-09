import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from './SellerProducts.module.css';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/seller/products');
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

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
    });
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({ name: '', description: '', price: '' });
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      await api.put(`/seller/products/${editingProduct}`, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
      });
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setEditError(err.response?.data?.error?.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'status', label: 'Status' },
  ];

  const tableData = products.map((p) => ({
    ...p,
    price: `₹${Number(p.price).toFixed(2)}`,
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Products</h1>

      {editingProduct && (
        <div className={styles.editOverlay}>
          <form className={styles.editForm} onSubmit={handleEditSubmit}>
            <h2 className={styles.editTitle}>Edit Product</h2>
            {editError && <p className={styles.editError}>{editError}</p>}
            <FormInput
              label="Name"
              id="edit-name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <FormInput
              label="Description"
              id="edit-description"
              type="textarea"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <FormInput
              label="Price"
              id="edit-price"
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              required
            />
            <div className={styles.editActions}>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p className={styles.empty}>No products yet. Add your first product to get started.</p>
      ) : (
        <Table
          columns={columns}
          data={tableData}
          actions={(row) => (
            <Button variant="secondary" onClick={() => handleEdit(products.find((p) => p.id === row.id))}>
              Edit
            </Button>
          )}
        />
      )}
    </div>
  );
}
