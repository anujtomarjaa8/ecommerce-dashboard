'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        data: null,
        error: { message: 'Username is required', code: 'VALIDATION_ERROR' }
      });
    }

    if (!password || typeof password !== 'string' || password.length < 3) {
      return res.status(400).json({
        data: null,
        error: { message: 'Password is required and must be at least 3 characters', code: 'VALIDATION_ERROR' }
      });
    }

    const validRoles = ['buyer', 'seller', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        data: null,
        error: { message: 'Role must be one of: buyer, seller, admin', code: 'VALIDATION_ERROR' }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user into database
    let result;
    try {
      const stmt = db.prepare(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
      );
      result = stmt.run(username.trim(), passwordHash, role);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
        return res.status(409).json({
          data: null,
          error: { message: 'Username already exists', code: 'CONFLICT' }
        });
      }
      throw err;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: result.lastInsertRowid, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      data: {
        token,
        user: { id: result.lastInsertRowid, username: username.trim(), role }
      },
      error: null
    });
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        data: null,
        error: { message: 'Username is required', code: 'VALIDATION_ERROR' }
      });
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({
        data: null,
        error: { message: 'Password is required', code: 'VALIDATION_ERROR' }
      });
    }

    // Find user by username
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username.trim());

    if (!user) {
      return res.status(401).json({
        data: null,
        error: { message: 'Invalid credentials', code: 'UNAUTHORIZED' }
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        data: null,
        error: { message: 'Invalid credentials', code: 'UNAUTHORIZED' }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role }
      },
      error: null
    });
  } catch (err) {
    return res.status(500).json({
      data: null,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.status(200).json({
    data: { message: 'Logged out successfully' },
    error: null
  });
});

module.exports = router;
