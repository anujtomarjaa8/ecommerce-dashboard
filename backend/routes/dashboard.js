'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/buyer — buyer summary stats
router.get('/buyer', authorize('buyer'), (req, res) => {
  try {
    const wishlistCount = db.prepare(
      'SELECT COUNT(*) as count FROM wishlist_items WHERE buyer_id = ?'
    ).get(req.user.id).count;

    const cartCount = db.prepare(
      'SELECT COUNT(*) as count FROM cart_items WHERE buyer_id = ?'
    ).get(req.user.id).count;

    const ordersCount = db.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE buyer_id = ?'
    ).get(req.user.id).count;

    // Order history grouped by date, last 7 entries
    const orderHistory = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM orders
      WHERE buyer_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all(req.user.id);

    return sendSuccess(res, {
      wishlistCount,
      cartCount,
      ordersCount,
      orderHistory
    });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// GET /api/dashboard/seller — seller summary stats
router.get('/seller', authorize('seller'), (req, res) => {
  try {
    const totalProducts = db.prepare(
      "SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND status != 'removed'"
    ).get(req.user.id).count;

    const productsSold = db.prepare(`
      SELECT COUNT(*) as count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `).get(req.user.id).count;

    const totalRevenueResult = db.prepare(`
      SELECT COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `).get(req.user.id);
    const totalRevenue = totalRevenueResult.revenue;

    // Revenue history grouped by date, last 7 entries
    const revenueHistory = db.prepare(`
      SELECT DATE(o.created_at) as date, SUM(oi.price_at_purchase * oi.quantity) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = ?
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all(req.user.id);

    return sendSuccess(res, {
      totalProducts,
      productsSold,
      totalRevenue,
      revenueHistory
    });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// GET /api/dashboard/admin — admin summary stats
router.get('/admin', authorize('admin'), (req, res) => {
  try {
    const totalUsers = db.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).get().count;

    const totalProducts = db.prepare(
      "SELECT COUNT(*) as count FROM products WHERE status != 'removed'"
    ).get().count;

    const totalOrders = db.prepare(
      'SELECT COUNT(*) as count FROM orders'
    ).get().count;

    // User registrations grouped by date, last 7 entries
    const userRegistrations = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    // Order volume grouped by date, last 7 entries
    const orderVolume = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    return sendSuccess(res, {
      totalUsers,
      totalProducts,
      totalOrders,
      userRegistrations,
      orderVolume
    });
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
