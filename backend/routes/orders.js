'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');
const db = require('../db');

const router = express.Router();

// All order routes require buyer role
router.use(authenticate, authorize('buyer'));

// POST /api/orders — create order from cart items
router.post('/', (req, res) => {
  try {
    // Get all cart items for the buyer
    const cartStmt = db.prepare(`
      SELECT c.id, c.product_id, c.quantity, p.price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.buyer_id = ?
    `);
    const cartItems = cartStmt.all(req.user.id);

    if (cartItems.length === 0) {
      return sendError(res, 'Cart is empty', 'VALIDATION_ERROR', 400);
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Use a transaction to ensure atomicity
    const createOrder = db.transaction(() => {
      // Insert order
      const orderStmt = db.prepare(
        'INSERT INTO orders (buyer_id, total) VALUES (?, ?)'
      );
      const orderResult = orderStmt.run(req.user.id, total);
      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      const orderItemStmt = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)'
      );
      const orderItems = [];
      for (const item of cartItems) {
        orderItemStmt.run(orderId, item.product_id, item.quantity, item.price);
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.price
        });
      }

      // Clear cart
      const clearCartStmt = db.prepare('DELETE FROM cart_items WHERE buyer_id = ?');
      clearCartStmt.run(req.user.id);

      return { orderId, total, orderItems };
    });

    const result = createOrder();

    return sendSuccess(res, {
      id: result.orderId,
      buyer_id: req.user.id,
      total: result.total,
      status: 'completed',
      items: result.orderItems
    }, 201);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

// GET /api/orders — get buyer's order history with order items
router.get('/', (req, res) => {
  try {
    // Get all orders for the buyer
    const ordersStmt = db.prepare(
      'SELECT id, buyer_id, total, status, created_at FROM orders WHERE buyer_id = ? ORDER BY created_at DESC'
    );
    const orders = ordersStmt.all(req.user.id);

    // Get order items for each order
    const orderItemsStmt = db.prepare(`
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
             p.name, p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: orderItemsStmt.all(order.id)
    }));

    return sendSuccess(res, ordersWithItems);
  } catch (err) {
    return sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;
