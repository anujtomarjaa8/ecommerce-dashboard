'use strict';

const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

// On Vercel the deploy filesystem is read-only.
// /tmp is the only writable directory (512 MB, ephemeral per container).
// Locally this falls back to backend/db/ecommerce.db via the env var or default.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ecommerce.db');

function createDatabase(dbPath) {
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('buyer', 'seller', 'admin')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL CHECK(price > 0),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'sold', 'removed')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(buyer_id, product_id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(buyer_id, product_id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  return db;
}

const db = createDatabase(DB_PATH);

// ---------------------------------------------------------------------------
// Auto-seed — runs synchronously on every cold start, skips if data exists.
// Uses bcrypt.hashSync so it stays fully synchronous (no async waterfall
// needed at module load time).  password123 is the shared demo password.
// ---------------------------------------------------------------------------
function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  if (userCount > 0) return; // Already seeded — nothing to do.

  console.log('[db] Empty database detected — running auto-seed...');

  // Pre-hash once; reuse for all demo accounts.
  const passwordHash = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
  );

  insertUser.run('buyer1',  passwordHash, 'buyer');
  insertUser.run('seller1', passwordHash, 'seller');
  insertUser.run('admin1',  passwordHash, 'admin');

  const seller = db.prepare("SELECT id FROM users WHERE username = 'seller1'").get();

  const insertProduct = db.prepare(
    'INSERT INTO products (seller_id, name, description, price) VALUES (?, ?, ?, ?)'
  );

  const products = [
    { name: 'Wireless Headphones',  description: 'Premium noise-cancelling headphones, 30-hour battery',   price: 2999.00 },
    { name: 'Laptop Backpack',       description: 'Water-resistant backpack with USB charging port',          price: 1499.00 },
    { name: 'Smart Watch',           description: 'Fitness tracker with heart rate monitor and GPS',          price: 4999.00 },
    { name: 'Running Shoes',         description: 'Lightweight breathable shoes with cushioned sole',         price: 3499.00 },
    { name: 'Coffee Maker',          description: 'Automatic drip coffee maker with programmable timer',      price: 2499.00 },
    { name: 'Desk Lamp',             description: 'LED lamp with adjustable brightness and colour temp',      price:  899.00 },
    { name: 'Bluetooth Speaker',     description: 'Portable waterproof speaker with deep bass',              price: 1999.00 },
    { name: 'Yoga Mat',              description: 'Non-slip eco-friendly mat with carrying strap',            price:  799.00 },
  ];

  for (const p of products) {
    insertProduct.run(seller.id, p.name, p.description, p.price);
  }

  console.log('[db] Auto-seed complete — 3 users, 8 products created.');
}

try {
  seedIfEmpty();
} catch (err) {
  // Log but don't crash the server — existing data may still be usable.
  console.error('[db] Auto-seed failed:', err.message);
}

module.exports = db;
module.exports.createDatabase = createDatabase;
