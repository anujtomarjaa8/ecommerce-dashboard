# Frontend — E-Commerce Role Dashboard UI

## What is this?

This is the frontend (client-side) of our e-commerce dashboard application. It's a **React** single-page application that provides a beautiful, colorful, interactive interface for three types of users: Buyers, Sellers, and Admins.

Each role sees a completely different dashboard with different navigation options, pages, and functionality — all controlled by role-based access. All prices are displayed in **INR (₹)**.

## How does it work?

### The Big Picture

1. User opens the app → sees Login page (purple gradient background)
2. User logs in (or registers) → gets redirected to their role-specific dashboard
3. Based on their role, they see different sidebar navigation items
4. Each page fetches data from the backend API and displays it
5. All actions (add to cart, create product, etc.) send requests to the backend

### Authentication Flow

```
User enters credentials → Frontend sends to backend → Backend returns JWT token
→ Frontend stores token in localStorage → Token sent with every API request
→ If token expires/invalid → User redirected to login
```

### Role-Based Routing

The app uses **React Router** with route guards:
- **ProtectedRoute**: If you're not logged in, you get redirected to `/login`
- **RoleRoute**: If you try to access a page meant for a different role, you get redirected to `/dashboard`

### State Management

We use **React Context + useReducer** (built into React, no extra library needed):
- `AuthContext` holds the current user info (username, role, token)
- It provides `login()`, `register()`, and `logout()` functions to all components
- On page refresh, it restores the user from localStorage (so you stay logged in)

## What Each Role Sees

### 🛒 Buyer
- **Dashboard**: Colorful gradient stat cards (wishlist count, cart count, orders count) + order history bar chart
- **Products**: Browse all products displayed as cards with emoji visuals, gradient backgrounds, and "Add to Wishlist" / "Add to Cart" buttons
- **Wishlist**: Table of saved products with remove functionality
- **Cart**: Table of cart items with quantities, line totals, grand total, and "Purchase" button
- **Orders**: Expandable order history showing individual items

### 📦 Seller
- **Dashboard**: Gradient stat cards (total products, sold count, revenue in ₹) + revenue line chart
- **My Products**: Table of your products with inline edit modal
- **Add Product**: Form to create a new product listing (name, description, price)

### ⚙️ Admin
- **Dashboard**: Gradient stat cards (total users, products, orders) + user registration bar chart + order volume line chart
- **Users**: Table of all users with delete capability (with confirmation)
- **Products**: Table of all products with remove capability (with confirmation)

## Folder Structure

```
frontend/
├── index.html                 ← HTML entry point
├── vite.config.js             ← Vite config (proxies /api to backend on port 3000)
├── package.json               ← Dependencies and scripts
└── src/
    ├── main.jsx               ← React entry point (renders App)
    ├── App.jsx                ← Root component with all routes defined
    ├── index.css              ← Global styles, CSS variables, gradient definitions
    ├── context/
    │   └── AuthContext.jsx    ← Authentication state (useReducer + localStorage)
    ├── utils/
    │   └── api.js             ← Axios instance with JWT interceptor + 401 handling
    ├── components/            ← Reusable UI building blocks
    │   ├── Button.jsx         ← Gradient button (primary/secondary/danger)
    │   ├── Card.jsx           ← Content card with hover lift effect
    │   ├── ChartCard.jsx      ← Card wrapper for chart visualizations
    │   ├── Table.jsx          ← Data table with configurable columns + actions
    │   ├── FormInput.jsx      ← Form field (input/select/textarea) with validation
    │   ├── LoadingSpinner.jsx ← Colorful spinning animation
    │   ├── ErrorMessage.jsx   ← Error display with retry button
    │   ├── Sidebar.jsx        ← Gradient sidebar with role-based nav items
    │   ├── Layout.jsx         ← Page layout (sidebar + gradient content area)
    │   ├── ProtectedRoute.jsx ← Redirects unauthenticated users to /login
    │   ├── RoleRoute.jsx      ← Redirects wrong-role users to /dashboard
    │   └── navItems.js        ← Navigation menu configuration per role
    └── pages/                 ← Full page components
        ├── LoginPage.jsx      ← Login form (purple gradient background)
        ├── RegisterPage.jsx   ← Registration form (green gradient background)
        ├── DashboardRouter.jsx← Renders correct dashboard based on user role
        ├── BuyerDashboard.jsx ← Gradient stat cards + order history chart
        ├── ProductListing.jsx ← Product grid with emoji visuals + gradient cards
        ├── WishlistPage.jsx   ← Wishlist table with remove buttons
        ├── CartPage.jsx       ← Cart table + total + purchase button
        ├── OrdersPage.jsx     ← Expandable order history
        ├── SellerDashboard.jsx← Gradient stat cards + revenue chart
        ├── SellerProducts.jsx ← Product table + edit modal overlay
        ├── AddProductPage.jsx ← New product form
        ├── AdminDashboard.jsx ← Gradient stat cards + 2 charts
        ├── AdminUsers.jsx     ← User management table
        └── AdminProducts.jsx  ← Product management table
```

## How to Run

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173` and automatically proxies `/api` requests to the backend at `http://localhost:3000`.

## Key Concepts Explained

### Vite
A modern build tool that's much faster than Create React App. It provides:
- Instant hot module replacement (changes appear immediately in browser)
- Built-in CSS Modules support
- Dev server with proxy configuration (so frontend on port 5173 can talk to backend on port 3000)

### CSS Modules
Each component has its own `.module.css` file. Class names are automatically scoped to that component, so styles never leak or conflict between components. You import them like:
```jsx
import styles from './MyComponent.module.css';
<div className={styles.container}>...</div>
```

### Axios Interceptors
Our `api.js` file creates an Axios instance that automatically:
- Attaches the JWT token to every request (so you don't have to do it manually)
- Catches 401 errors (expired/invalid token) and redirects to login page

### React Router v6
We use nested routes with layout components:
- `ProtectedRoute` wraps all authenticated pages (redirects to /login if not logged in)
- `Layout` provides the sidebar + content area structure
- `RoleRoute` restricts pages to specific roles (redirects to /dashboard if wrong role)

### Chart.js
Used for data visualization on dashboards. We use `react-chartjs-2` which provides React components for Chart.js charts (Bar charts for orders, Line charts for revenue).

### Product Visuals (Emoji + Gradient System)
Instead of relying on external image APIs (which can fail), each product gets a **colorful gradient card with a relevant emoji** based on keyword matching:
- "Headphones" → 🎧 on purple gradient
- "Watch" → ⌚ on blue gradient
- "Shoes" → 👟 on green gradient
- "Speaker" → 🔊 on pink-yellow gradient
- Unknown products → 📦 on soft indigo fallback

This approach is zero-dependency, instant-loading, and always works offline.

### Responsive Design
- Desktop (>768px): Full sidebar visible on the left
- Mobile (≤768px): Sidebar hidden, hamburger menu button to toggle it

## UI Design

The app uses a colorful, modern design with:
- **Gradient backgrounds** — Login (purple), Register (green), content area (soft blue-purple)
- **Gradient stat cards** — Each dashboard metric has its own vibrant gradient (pink, blue, green, etc.)
- **Emoji product visuals** — Keyword-matched emojis on gradient backgrounds (no external API needed)
- **Smooth animations** — Hover lift effects on cards/buttons, slide-in toast notifications, card entrance animations
- **Purple/indigo gradient sidebar** — With glowing active nav states and role badge
- **Gradient buttons** — Primary (purple), secondary (soft indigo), danger (red-orange)
- **Consistent color palette** — Indigo/purple as primary, with role-specific accent colors

## Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI library (functional components, hooks) |
| Vite | 5.4 | Build tool and dev server |
| React Router | 6.30 | Client-side routing with nested layouts |
| Axios | 1.16 | HTTP client for API calls |
| Chart.js | 4.5 | Data visualization (bar + line charts) |
| react-chartjs-2 | 5.3 | React wrapper for Chart.js |
| CSS Modules | (built-in) | Scoped component styling |
| prop-types | 15.8 | Runtime type checking for component props |
| ESLint | 9.13 | Code quality linting |
