# E-Commerce Role-Based Dashboard

A full-stack e-commerce dashboard application with role-based access control supporting three user roles: **Buyer**, **Seller**, and **Admin**. Each role receives a tailored dashboard with relevant data visualizations, navigation, and functionality. All prices are displayed in **INR (₹)**.

## Features

### 🛒 Buyer
- Browse all available products with visual product cards
- Add products to wishlist and cart
- Manage cart (view items, total price, purchase)
- View order history with expandable item details
- Dashboard with activity summary and order history chart

### 📦 Seller
- Create and manage product listings
- Edit product name, description, and price
- Dashboard with sales metrics and revenue chart

### ⚙️ Admin
- View and manage all platform users
- View and manage all products
- Dashboard with platform-wide stats and charts (user registrations, order volume)

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library (functional components + hooks) |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing with role-based guards |
| Chart.js + react-chartjs-2 | Data visualization |
| Axios | HTTP client with JWT interceptors |
| CSS Modules | Scoped component styling with gradients |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| SQLite (better-sqlite3) | Persistent file-based database |
| JWT (jsonwebtoken) | Stateless authentication |
| bcrypt | Password hashing |
| cors | Cross-origin resource sharing |

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Backend Setup

```bash
cd backend
npm install
npm run seed    # Creates demo users and products
npm run dev     # Starts server on port 3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on port 5173, proxies API to backend
```

### Running Both Together

1. Start the backend in one terminal: `cd backend && npm run dev`
2. Start the frontend in another terminal: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser

## Demo Accounts (after seeding)

| Username | Password | Role |
|----------|----------|------|
| buyer1 | password123 | Buyer |
| seller1 | password123 | Seller |
| admin1 | password123 | Admin |

## Project Structure

```
├── README.md
├── backend/
│   ├── server.js            # Express app entry point (port 3000)
│   ├── seed.js              # Populates demo data
│   ├── db/                  # SQLite database initialization
│   ├── middleware/          # Auth (JWT) and error handling
│   ├── routes/              # All API route handlers
│   ├── utils/               # Response helpers, validation
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js       # Vite config with API proxy to port 3000
│   ├── src/
│   │   ├── App.jsx          # Root component with all routes
│   │   ├── components/      # Reusable UI components (Button, Card, Table, etc.)
│   │   ├── pages/           # Role-specific page components
│   │   ├── context/         # AuthContext (React Context + useReducer)
│   │   └── utils/           # Axios instance with auth interceptors
│   └── package.json
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite** | Zero-config, file-based persistence. No external database service needed. |
| **JWT authentication** | Stateless tokens — no session store required. |
| **bcrypt** | Industry-standard password hashing with built-in salt. |
| **CSS Modules + Gradients** | Scoped styles with colorful, modern UI. No extra CSS framework. |
| **React Context + useReducer** | Sufficient for this scale. No Redux needed. |
| **Emoji-based product visuals** | Keyword-matched emojis on gradient cards. No external image API dependency — always renders instantly. |
| **INR currency (₹)** | All prices displayed in Indian Rupees. |
| **Port 3000 for backend** | Avoids conflict with macOS AirPlay Receiver (which uses port 5000). |
| **Vite dev proxy** | Frontend proxies `/api` to backend, avoiding CORS issues. |

## API Overview

All endpoints return JSON with consistent structure:

```json
{
  "data": null | object | array,
  "error": null | { "message": "string", "code": "string" }
}
```

Key endpoint groups:
- `POST /api/auth/register` and `POST /api/auth/login` — Authentication
- `GET /api/products` — Product browsing (Buyer)
- `GET|POST|DELETE /api/wishlist` — Wishlist management (Buyer)
- `GET|POST|PUT|DELETE /api/cart` — Cart management (Buyer)
- `GET|POST /api/orders` — Order management (Buyer)
- `GET|POST|PUT /api/seller/products` — Product management (Seller)
- `GET|DELETE /api/admin/users` — User management (Admin)
- `GET|DELETE /api/admin/products` — Product oversight (Admin)
- `GET /api/dashboard/{role}` — Dashboard statistics
