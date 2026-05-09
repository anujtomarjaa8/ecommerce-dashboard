# Backend — E-Commerce Role Dashboard API

## What is this?

This is the backend (server-side) of our e-commerce dashboard application. It's a REST API built with **Node.js** and **Express** that handles all the business logic — user registration, login, product management, shopping cart, wishlist, orders, and dashboard statistics.

Think of it as the "brain" of the application. The frontend (React app) sends requests to this backend, and the backend processes them, stores/retrieves data from the database, and sends back responses.

## How does it work?

### The Flow

1. A user interacts with the frontend (e.g., clicks "Add to Cart")
2. The frontend sends an HTTP request to the backend (e.g., `POST /api/cart`)
3. The backend checks if the user is authenticated (via JWT token)
4. The backend checks if the user has the right role (e.g., only buyers can add to cart)
5. The backend performs the operation (e.g., inserts into the database)
6. The backend sends back a JSON response

### Authentication (How Login Works)

- When a user registers or logs in, the backend creates a **JWT token** (a secure encoded string)
- This token contains the user's ID and role
- The frontend stores this token and sends it with every subsequent request
- The backend verifies this token on every protected request
- Passwords are never stored in plain text — they're hashed using **bcrypt**

### Database (Where Data Lives)

We use **SQLite** — a simple file-based database. No need to install MySQL or PostgreSQL. The database file (`ecommerce.db`) is created automatically when the server starts.

**Tables:**
| Table | What it stores |
|-------|---------------|
| `users` | Usernames, hashed passwords, roles (buyer/seller/admin) |
| `products` | Product name, description, price (in INR), which seller created it |
| `cart_items` | Which buyer has which product in their cart (persists across sessions) |
| `wishlist_items` | Which buyer has which product in their wishlist (persists across sessions) |
| `orders` | Completed purchases with total amount in INR |
| `order_items` | Individual items within each order with price at time of purchase |

## Folder Structure

```
backend/
├── server.js              ← Entry point. Sets up Express, mounts all routes (port 3000)
├── seed.js                ← Script to populate sample data for demo
├── package.json           ← Dependencies and npm scripts
├── db/
│   └── index.js           ← Database setup. Creates all 6 tables on first run
├── middleware/
│   ├── auth.js            ← JWT verification + role checking
│   └── errorHandler.js    ← Catches unhandled errors, returns generic 500
├── routes/
│   ├── auth.js            ← Register, Login, Logout endpoints
│   ├── products.js        ← Browse all products (for buyers)
│   ├── cart.js            ← Add/remove/view cart items (buyers only)
│   ├── wishlist.js        ← Add/remove/view wishlist items (buyers only)
│   ├── orders.js          ← Create orders, view order history (buyers only)
│   ├── seller.js          ← Create/edit products (sellers only)
│   ├── admin.js           ← Manage users and products (admins only)
│   └── dashboard.js       ← Statistics for each role's dashboard
└── utils/
    ├── response.js        ← Helper to send consistent JSON responses
    └── validation.js      ← Input validation functions
```

## API Endpoints

Every response follows this format:
```json
{
  "data": <the actual data or null>,
  "error": <error object or null>
}
```

### Public (No login required)

| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/auth/register` | Create a new account (username, password, role) |
| POST | `/api/auth/login` | Log in and get a JWT token |
| POST | `/api/auth/logout` | Logout (client-side token removal) |

### Buyer Endpoints (Must be logged in as buyer)

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/products` | See all available products |
| GET | `/api/wishlist` | View your wishlist |
| POST | `/api/wishlist` | Add a product to wishlist |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist |
| GET | `/api/cart` | View your cart (items + total) |
| POST | `/api/cart` | Add a product to cart |
| PUT | `/api/cart/:itemId` | Change quantity |
| DELETE | `/api/cart/:itemId` | Remove from cart |
| POST | `/api/orders` | Purchase everything in cart |
| GET | `/api/orders` | View past orders with items |
| GET | `/api/dashboard/buyer` | Get dashboard stats + chart data |

### Seller Endpoints (Must be logged in as seller)

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/seller/products` | See your own products |
| POST | `/api/seller/products` | Add a new product |
| PUT | `/api/seller/products/:id` | Edit a product (name, description, price) |
| GET | `/api/dashboard/seller` | Get dashboard stats + chart data |

### Admin Endpoints (Must be logged in as admin)

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/admin/users` | See all users |
| DELETE | `/api/admin/users/:id` | Delete a user (can't delete yourself) |
| GET | `/api/admin/products` | See all products with seller info |
| DELETE | `/api/admin/products/:id` | Remove a product (soft delete) |
| GET | `/api/dashboard/admin` | Get dashboard stats + chart data |

## How to Run

```bash
# Install dependencies
npm install

# Seed sample data (creates demo users and products)
npm run seed

# Start the server (with auto-restart on file changes)
npm run dev

# Or start without auto-restart
npm start
```

The server runs on `http://localhost:3000` by default. You can change this with the `PORT` environment variable.

## Demo Accounts (after seeding)

| Username | Password | Role |
|----------|----------|------|
| buyer1 | password123 | Buyer |
| seller1 | password123 | Seller |
| admin1 | password123 | Admin |

## Sample Products (after seeding)

All prices are in INR (₹):

| Product | Price |
|---------|-------|
| Wireless Headphones | ₹2,999 |
| Laptop Backpack | ₹1,499 |
| Smart Watch | ₹4,999 |
| Running Shoes | ₹3,499 |
| Coffee Maker | ₹2,499 |
| Desk Lamp | ₹899 |
| Bluetooth Speaker | ₹1,999 |
| Yoga Mat | ₹799 |

## Key Concepts Explained

### Middleware
Middleware are functions that run BEFORE your route handler. We use them for:
- **authenticate**: Checks if the request has a valid JWT token in the `Authorization: Bearer <token>` header
- **authorize('buyer')**: Checks if the logged-in user has the correct role
- **errorHandler**: Catches any unhandled errors so the server doesn't crash

### JWT (JSON Web Token)
A secure way to identify users without storing sessions on the server. The token is like a signed ID card — the server can verify it's genuine without looking anything up in a database. Our tokens expire after 24 hours.

### bcrypt
A password hashing algorithm. Even if someone gets access to the database, they can't see the actual passwords — only the hashed versions. We use 10 salt rounds.

### SQLite with WAL Mode
A lightweight database that stores everything in a single file. We enable WAL (Write-Ahead Logging) mode for better performance with concurrent reads. Perfect for demos and small applications — no separate database server needed.

### Transactions
When a buyer purchases items, we use a database transaction to ensure atomicity — either the entire purchase succeeds (order created + cart cleared) or nothing happens. This prevents partial states.

## Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express | 4.21 | Web framework for building APIs |
| better-sqlite3 | 11.7 | SQLite database driver (synchronous, fast) |
| jsonwebtoken | 9.0 | Creating and verifying JWT tokens |
| bcrypt | 5.1 | Password hashing |
| cors | 2.8 | Allow frontend to call backend from different port |
| nodemon | 3.1 | Auto-restart server during development |

## Troubleshooting

### Port already in use
If you get `EADDRINUSE` error, something else is using port 3000. Either kill that process or use a different port:
```bash
PORT=4000 npm run dev
```

### Database issues
If you need to start fresh, delete the database file and re-seed:
```bash
rm db/ecommerce.db
npm run seed
```
