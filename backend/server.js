const express = require('express');
const cors = require('cors');

const app = express();

// CORS — in production, restrict to the deployed Vercel URL.
// Set ALLOWED_ORIGIN in Vercel environment variables dashboard.
// Falls back to '*' locally so dev works without any extra config.
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin === '*' ? '*' : (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin on Vercel)
    if (!origin || origin === allowedOrigin) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());

app.use(express.json());

// Route mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ data: { status: 'ok' }, error: null });
});

// Global error handler (must be after all route mounts)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;

// Only start listening if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
