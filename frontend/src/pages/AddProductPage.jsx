import { useState } from 'react';
import api from '../utils/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import styles from './AddProductPage.module.css';

export default function AddProductPage() {
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/seller/products', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
      });
      setSuccess(true);
      setForm({ name: '', description: '', price: '' });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Add Product</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {success && <p className={styles.success}>Product added successfully!</p>}
        {error && <p className={styles.error}>{error}</p>}
        <FormInput
          label="Product Name"
          id="product-name"
          value={form.name}
          onChange={handleChange('name')}
          required
          placeholder="Enter product name"
        />
        <FormInput
          label="Description"
          id="product-description"
          type="textarea"
          value={form.description}
          onChange={handleChange('description')}
          placeholder="Enter product description"
        />
        <FormInput
          label="Price"
          id="product-price"
          type="number"
          value={form.price}
          onChange={handleChange('price')}
          required
          placeholder="0.00"
        />
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
