/**
 * Global error handling middleware.
 * Catches unhandled errors, logs internally, and returns a generic 500 response.
 * Does NOT expose stack traces, file paths, or internal details.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  return res.status(500).json({
    data: null,
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
  });
}

module.exports = errorHandler;
