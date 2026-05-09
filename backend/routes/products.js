'use strict';

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// GET /api/products — list all active products
router.get('/', authenticate, (req, res) => {
  try {
    const stmt = db.prepare(
      'SELECT id, name, description, price, seller_id, status, created_at FROM products WHERE status = ?'
    );
    const products = stmt.all('active');

    return sendSuccess(res, products);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
