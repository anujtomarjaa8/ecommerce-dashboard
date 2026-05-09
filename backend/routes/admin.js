'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// All routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/users — list all users (without password_hash)
router.get('/users', (req, res) => {
  try {
    const stmt = db.prepare(
      'SELECT id, username, role, created_at FROM users'
    );
    const users = stmt.all();

    return sendSuccess(res, users);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/admin/users/:id — delete user account
router.delete('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow admin to delete themselves
    if (Number(userId) === req.user.id) {
      return sendError(res, 'Cannot delete your own account', 'FORBIDDEN', 403);
    }

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existing) {
      return sendError(res, 'User not found', 'NOT_FOUND', 404);
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return sendSuccess(res, { message: 'User deleted' });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// GET /api/admin/products — list all products with seller info
router.get('/products', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT p.id, p.name, p.description, p.price, p.status, p.created_at, p.seller_id,
             u.username AS seller_username
      FROM products p
      JOIN users u ON p.seller_id = u.id
    `);
    const products = stmt.all();

    return sendSuccess(res, products);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// DELETE /api/admin/products/:id — soft delete product (set status to 'removed')
router.delete('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!existing) {
      return sendError(res, 'Product not found', 'NOT_FOUND', 404);
    }

    db.prepare("UPDATE products SET status = 'removed' WHERE id = ?").run(productId);

    return sendSuccess(res, { message: 'Product removed' });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
