/**
 * Response helper utility for consistent API response format.
 * All responses follow: { data, error }
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {*} data - Response data payload
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ data, error: null });
}

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {string} code - Machine-readable error code
 * @param {number} statusCode - HTTP status code (default 400)
 */
function sendError(res, message, code, statusCode = 400) {
  return res.status(statusCode).json({ data: null, error: { message, code } });
}

module.exports = { sendSuccess, sendError };
