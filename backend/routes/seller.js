'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const { validateProduct } = require('../utils/validation');
const db = require('../db');

const router = express.Router();

// All routes require seller role
router.use(authenticate, authorize('seller'));

// GET /api/seller/products — get seller's own products
router.get('/products', (req, res) => {
  try {
    const stmt = db.prepare(
      'SELECT id, name, description, price, status, created_at FROM products WHERE seller_id = ?'
    );
    const products = stmt.all(req.user.id);

    return sendSuccess(res, products);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/seller/products — create new product
router.post('/products', (req, res) => {
  try {
    const validation = validateProduct(req.body);
    if (!validation.valid) {
      return sendError(res, validation.message, 'VALIDATION_ERROR', 400);
    }

    const { name, description, price } = req.body;

    const stmt = db.prepare(
      'INSERT INTO products (seller_id, name, description, price) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(req.user.id, name.trim(), description || '', price);

    const product = db.prepare('SELECT id, name, description, price, status, created_at FROM products WHERE id = ?')
      .get(result.lastInsertRowid);

    return sendSuccess(res, product, 201);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// PUT /api/seller/products/:id — update product (only own products)
router.put('/products/:id', (req, res) => {
  try {
    const validation = validateProduct(req.body);
    if (!validation.valid) {
      return sendError(res, validation.message, 'VALIDATION_ERROR', 400);
    }

    const { name, description, price } = req.body;
    const productId = req.params.id;

    // Only allow updating own products
    const existing = db.prepare('SELECT id FROM products WHERE id = ? AND seller_id = ?')
      .get(productId, req.user.id);

    if (!existing) {
      return sendError(res, 'Product not found', 'NOT_FOUND', 404);
    }

    db.prepare('UPDATE products SET name = ?, description = ?, price = ? WHERE id = ? AND seller_id = ?')
      .run(name.trim(), description || '', price, productId, req.user.id);

    const updated = db.prepare('SELECT id, name, description, price, status, created_at FROM products WHERE id = ?')
      .get(productId);

    return sendSuccess(res, updated);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
