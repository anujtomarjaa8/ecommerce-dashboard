'use strict';

const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Seeding database...');

  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Users already exist, skipping user seed.');
  } else {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const insertUser = db.prepare(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
    );

    insertUser.run('buyer1', passwordHash, 'buyer');
    console.log('  Created user: buyer1 (buyer)');

    insertUser.run('seller1', passwordHash, 'seller');
    console.log('  Created user: seller1 (seller)');

    insertUser.run('admin1', passwordHash, 'admin');
    console.log('  Created user: admin1 (admin)');
  }

  // Check if products already exist
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (existingProducts.count > 0) {
    console.log('Products already exist, skipping product seed.');
  } else {
    const seller = db.prepare('SELECT id FROM users WHERE username = ?').get('seller1');
    if (!seller) {
      console.error('seller1 user not found. Cannot seed products.');
      process.exit(1);
    }

    const insertProduct = db.prepare(
      'INSERT INTO products (seller_id, name, description, price) VALUES (?, ?, ?, ?)'
    );

    const products = [
      { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life', price: 2999.00 },
      { name: 'Laptop Backpack', description: 'Water-resistant laptop backpack with USB charging port', price: 1499.00 },
      { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor and GPS', price: 4999.00 },
      { name: 'Running Shoes', description: 'Lightweight breathable running shoes with cushioned sole', price: 3499.00 },
      { name: 'Coffee Maker', description: 'Automatic drip coffee maker with programmable timer', price: 2499.00 },
      { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness and color temperature', price: 899.00 },
      { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker with deep bass', price: 1999.00 },
      { name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat with carrying strap', price: 799.00 },
    ];

    for (const product of products) {
      insertProduct.run(seller.id, product.name, product.description, product.price);
      console.log(`  Created product: "${product.name}" - $${product.price}`);
    }
  }

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
