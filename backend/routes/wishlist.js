'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// All wishlist routes require buyer role
router.use(authenticate, authorize('buyer'));

// GET /api/wishlist — get buyer's wishlist items with product details
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT w.id, w.product_id, w.added_at,
             p.name, p.description, p.price, p.seller_id, p.status
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.buyer_id = ?
    `);
    const items = stmt.all(req.user.id);

    return sendSuccess(res, items);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// POST /api/wishlist — add product to wishlist
router.post('/', (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 'productId is required', 'VALIDATION_ERROR', 400);
    }

    const stmt = db.prepare(
      'INSERT INTO wishlist_items (buyer_id, product_id) VALUES (?, ?)'
    );

    try {
      stmt.run(req.user.id, productId);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
        return sendError(res, 'Product already in wishlist', 'CONFLICT', 409);
      }
      throw err;
    }

    return sendSuccess(res, { message: 'Product added to wishlist' }, 201);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/wishlist/:productId — remove product from wishlist
router.delete('/:productId', (req, res) => {
  try {
    const { productId } = req.params;

    const stmt = db.prepare(
      'DELETE FROM wishlist_items WHERE buyer_id = ? AND product_id = ?'
    );
    const result = stmt.run(req.user.id, productId);

    if (result.changes === 0) {
      return sendError(res, 'Product not found in wishlist', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, { message: 'Product removed from wishlist' });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
