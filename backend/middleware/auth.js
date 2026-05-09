'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate requests via JWT in the Authorization header.
 * Expects format: "Bearer <token>"
 * Attaches decoded user info (id, role) to req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      data: null,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      data: null,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({
      data: null,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
    });
  }
}

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used after authenticate middleware.
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        data: null,
        error: { message: 'Insufficient permissions', code: 'FORBIDDEN' }
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
