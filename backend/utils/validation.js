/**
 * Input validation utility.
 * Each function returns { valid: true } or { valid: false, message: '...' }
 */

const VALID_ROLES = ['buyer', 'seller', 'admin'];

/**
 * Validate registration request body.
 * - username: required, non-empty string
 * - password: required, min 3 characters
 * - role: must be one of buyer, seller, admin
 */
function validateRegistration(body) {
  if (!body || typeof body.username !== 'string' || body.username.trim() === '') {
    return { valid: false, message: 'Username is required and must be a non-empty string' };
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 3) {
    return { valid: false, message: 'Password is required and must be at least 3 characters' };
  }
  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return { valid: false, message: 'Role is required and must be one of: buyer, seller, admin' };
  }
  return { valid: true };
}

/**
 * Validate login request body.
 * - username: required
 * - password: required
 */
function validateLogin(body) {
  if (!body || typeof body.username !== 'string' || body.username.trim() === '') {
    return { valid: false, message: 'Username is required' };
  }
  if (!body.password || typeof body.password !== 'string' || body.password.trim() === '') {
    return { valid: false, message: 'Password is required' };
  }
  return { valid: true };
}

/**
 * Validate product creation/edit request body.
 * - name: required, non-empty string
 * - price: required, positive number
 */
function validateProduct(body) {
  if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
    return { valid: false, message: 'Product name is required and must be a non-empty string' };
  }
  if (body.price === undefined || body.price === null || typeof body.price !== 'number' || body.price <= 0) {
    return { valid: false, message: 'Price is required and must be a positive number' };
  }
  return { valid: true };
}

module.exports = { validateRegistration, validateLogin, validateProduct };
