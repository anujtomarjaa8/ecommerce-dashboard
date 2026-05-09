'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// All cart routes require buyer role
router.use(authenticate, authorize('buyer'));

// GET /api/cart — get buyer's cart items with product details and computed total
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT c.id, c.product_id, c.quantity, c.added_at,
             p.name, p.description, p.price, p.seller_id, p.status
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.buyer_id = ?
    `);
    const items = stmt.all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return sendSuccess(res, { items, total });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/cart — add product to cart
router.post('/', (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 'productId is required', 'VALIDATION_ERROR', 400);
    }

    const stmt = db.prepare(
      'INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES (?, ?, 1)'
    );

    try {
      stmt.run(req.user.id, productId);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
        return sendError(res, 'Product already in cart', 'CONFLICT', 409);
      }
      throw err;
    }

    return sendSuccess(res, { message: 'Product added to cart' }, 201);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// PUT /api/cart/:itemId — update cart item quantity
router.put('/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return sendError(res, 'Quantity must be a positive number', 'VALIDATION_ERROR', 400);
    }

    const stmt = db.prepare(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND buyer_id = ?'
    );
    const result = stmt.run(quantity, itemId, req.user.id);

    if (result.changes === 0) {
      return sendError(res, 'Cart item not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, { message: 'Cart item updated' });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/cart/:itemId — remove item from cart
router.delete('/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;

    const stmt = db.prepare(
      'DELETE FROM cart_items WHERE id = ? AND buyer_id = ?'
    );
    const result = stmt.run(itemId, req.user.id);

    if (result.changes === 0) {
      return sendError(res, 'Cart item not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, { message: 'Cart item removed' });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
