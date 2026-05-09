# Implementation Plan: E-Commerce Role Dashboard

## Overview

This plan implements a full-stack e-commerce dashboard with role-based access control (Buyer, Seller, Admin). The backend uses Node.js/Express with SQLite (better-sqlite3) and JWT authentication. The frontend uses React + Vite with Chart.js for data visualization, CSS Modules for styling, and React Context for state management. Tasks are ordered to build foundational layers first (database, auth) then layer features on top, ending with integration and wiring.

## Tasks

- [x] 1. Set up project structure and install dependencies
  - [x] 1.1 Initialize backend project with Express, better-sqlite3, bcrypt, jsonwebtoken, cors
    - Create `backend/` directory with `package.json`, install dependencies
    - Create `backend/server.js` entry point with Express app setup, CORS, JSON body parsing
    - Create modular folder structure: `routes/`, `middleware/`, `db/`, `utils/`
    - _Requirements: 10.1, 9.1_
  - [x] 1.2 Initialize frontend project with Vite + React
    - Create `frontend/` directory using Vite React template
    - Install axios, react-router-dom, chart.js, react-chartjs-2
    - Set up CSS Modules support (built into Vite)
    - Create folder structure: `src/components/`, `src/pages/`, `src/context/`, `src/utils/`, `src/__tests__/`
    - _Requirements: 10.1, 10.3_
  - [x] 1.3 Create README.md with project overview, setup instructions, tech stack, and design decisions
    - _Requirements: 10.2_

- [x] 2. Implement database layer
  - [x] 2.1 Create database initialization module (`backend/db/index.js`)
    - Initialize better-sqlite3 connection to `ecommerce.db` file
    - Create all tables (users, products, cart_items, wishlist_items, orders, order_items) with constraints and foreign keys as defined in the design schema
    - Enable WAL mode for better concurrent read performance
    - Export database instance for use in route handlers
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 3. Implement authentication backend
  - [x] 3.1 Create auth routes (`backend/routes/auth.js`)
    - POST `/api/auth/register` — validate input, hash password with bcrypt, insert user, return JWT with user id and role
    - POST `/api/auth/login` — validate credentials, compare bcrypt hash, return JWT with user id and role
    - POST `/api/auth/logout` — client-side only, return success
    - All responses follow `{ data, error }` format
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 9.2, 11.7_
  - [x] 3.2 Create auth middleware (`backend/middleware/auth.js`)
    - `authenticate` — verify JWT from Authorization header, attach user to request
    - `authorize(...roles)` — check user role against allowed roles, return 403 if mismatch
    - Return 401 for missing/invalid tokens
    - _Requirements: 2.3, 2.4_
  - [ ]* 3.3 Write property tests for authentication (backend)
    - **Property 1: Registration round-trip preserves user data**
    - **Property 2: Duplicate username rejection**
    - **Property 3: Authentication returns correct role in token**
    - **Property 4: Invalid credentials are rejected**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 11.1, 11.7**
  - [ ]* 3.4 Write property tests for auth middleware
    - **Property 5: Unauthenticated requests receive 401**
    - **Property 6: Wrong-role requests receive 403**
    - **Validates: Requirements 2.3, 2.4**

- [x] 4. Implement API response structure and error handling
  - [x] 4.1 Create response helper utility (`backend/utils/response.js`)
    - `sendSuccess(res, data, statusCode)` — wraps data in `{ data, error: null }`
    - `sendError(res, message, code, statusCode)` — wraps error in `{ data: null, error: { message, code } }`
    - _Requirements: 9.2_
  - [x] 4.2 Create global error handling middleware (`backend/middleware/errorHandler.js`)
    - Catch unhandled errors, log internally, return generic 500 response without exposing internals
    - _Requirements: 9.4_
  - [x] 4.3 Create input validation utility (`backend/utils/validation.js`)
    - Validation functions for registration, login, product creation/edit
    - Return 400 with descriptive message for invalid input
    - _Requirements: 9.3_
  - [ ]* 4.4 Write property tests for API response structure and error handling
    - **Property 15: API responses have consistent structure**
    - **Property 16: Invalid input returns 400 with message**
    - **Property 17: Server errors return generic 500 without internal details**
    - **Validates: Requirements 9.2, 9.3, 9.4**

- [x] 5. Checkpoint - Ensure backend foundation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Buyer backend routes
  - [x] 6.1 Create product routes (`backend/routes/products.js`)
    - GET `/api/products` — list all active products (authenticated)
    - _Requirements: 3.2_
  - [x] 6.2 Create wishlist routes (`backend/routes/wishlist.js`)
    - GET `/api/wishlist` — get buyer's wishlist items with product details
    - POST `/api/wishlist` — add product to wishlist (unique constraint)
    - DELETE `/api/wishlist/:productId` — remove product from wishlist
    - All routes require Buyer role
    - _Requirements: 3.3, 11.2_
  - [x] 6.3 Create cart routes (`backend/routes/cart.js`)
    - GET `/api/cart` — get buyer's cart items with product details and computed total
    - POST `/api/cart` — add product to cart (unique constraint, default quantity 1)
    - PUT `/api/cart/:itemId` — update cart item quantity
    - DELETE `/api/cart/:itemId` — remove item from cart
    - _Requirements: 3.4, 3.5, 11.3_
  - [x] 6.4 Create order routes (`backend/routes/orders.js`)
    - POST `/api/orders` — create order from cart items (capture price_at_purchase), clear cart
    - GET `/api/orders` — get buyer's order history with order items
    - _Requirements: 3.6, 11.4_
  - [ ]* 6.5 Write property tests for Buyer features
    - **Property 8: Cart total equals sum of item prices times quantities**
    - **Property 9: Purchase creates order and clears cart**
    - **Property 10: Wishlist persistence round-trip**
    - **Property 11: Cart persistence round-trip**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 11.2, 11.3, 11.4**

- [x] 7. Implement Seller backend routes
  - [x] 7.1 Create seller product routes (`backend/routes/seller.js`)
    - GET `/api/seller/products` — get seller's own products
    - POST `/api/seller/products` — create new product associated with seller
    - PUT `/api/seller/products/:id` — update product name, description, price (only own products)
    - All routes require Seller role
    - _Requirements: 4.2, 4.4, 4.6, 11.5_
  - [ ]* 7.2 Write property tests for Seller features
    - **Property 12: Product creation associates with seller**
    - **Property 13: Product edit persists new values**
    - **Validates: Requirements 4.4, 4.6, 11.5**

- [x] 8. Implement Admin backend routes
  - [x] 8.1 Create admin routes (`backend/routes/admin.js`)
    - GET `/api/admin/users` — list all users with username, role, created_at
    - DELETE `/api/admin/users/:id` — delete user account
    - GET `/api/admin/products` — list all products with seller info
    - DELETE `/api/admin/products/:id` — remove product (set status to 'removed')
    - All routes require Admin role
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [ ]* 8.2 Write property tests for Admin features
    - **Property 14: Admin deletion removes resource**
    - **Validates: Requirements 5.3, 5.5**

- [x] 9. Implement Dashboard stats endpoints
  - [x] 9.1 Create dashboard routes (`backend/routes/dashboard.js`)
    - GET `/api/dashboard/buyer` — return total wishlist items, cart items, past orders count
    - GET `/api/dashboard/seller` — return total products listed, products sold, total revenue
    - GET `/api/dashboard/admin` — return total users, total products, total orders
    - Include time-series data for charts (orders over time, revenue over time, registrations over time)
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 6.2, 6.3_
  - [ ]* 9.2 Write property tests for dashboard stats
    - **Property 18: Dashboard summary stats are accurate**
    - **Validates: Requirements 3.1, 4.1, 5.1**

- [x] 10. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement frontend authentication and context
  - [x] 11.1 Create AuthContext (`frontend/src/context/AuthContext.jsx`)
    - Provide user state (user object with id, username, role, token)
    - Provide login, register, and logout functions
    - Persist token in localStorage, restore on mount
    - Use useReducer for state management
    - _Requirements: 10.4, 1.7, 1.8_
  - [x] 11.2 Create Axios instance with interceptors (`frontend/src/utils/api.js`)
    - Attach JWT token to Authorization header on every request
    - Intercept 401 responses to trigger logout and redirect to login
    - _Requirements: 2.3_
  - [x] 11.3 Create Login and Register pages
    - `LoginPage.jsx` — form with username, password fields, link to register
    - `RegisterPage.jsx` — form with username, password, role selection (buyer/seller/admin)
    - Display error messages from API on failure
    - _Requirements: 1.1, 1.6_

- [x] 12. Implement frontend routing and layout
  - [x] 12.1 Create route protection components
    - `ProtectedRoute.jsx` — redirect unauthenticated users to `/login`
    - `RoleRoute.jsx` — redirect users accessing wrong role's routes to their dashboard
    - _Requirements: 1.7, 2.2_
  - [x] 12.2 Create responsive Sidebar and Layout components
    - `Sidebar.jsx` — role-based navigation items, hamburger menu on mobile (≤768px), highlight active item
    - `Layout.jsx` — page wrapper with sidebar and content area
    - Use CSS Modules for scoped styling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 12.3 Set up React Router with all routes
    - Configure routes for all pages per the design route table
    - Wrap role-specific routes with RoleRoute
    - Wrap all authenticated routes with ProtectedRoute
    - _Requirements: 2.1, 2.2_
  - [ ]* 12.4 Write property test for role-based navigation filtering
    - **Property 7: Role-based navigation filtering**
    - **Validates: Requirements 2.1, 7.4, 7.5, 7.6**

- [x] 13. Implement shared UI components
  - [x] 13.1 Create reusable UI components
    - `Button.jsx` — variants: primary, secondary, danger
    - `Card.jsx` — content container with optional title
    - `Table.jsx` — data table with column configuration
    - `FormInput.jsx` — labeled input with validation error display
    - `LoadingSpinner.jsx` — loading state indicator
    - `ErrorMessage.jsx` — error display with retry button
    - `ChartCard.jsx` — wrapper for chart visualizations
    - All components use CSS Modules for styling
    - _Requirements: 10.5, 8.1, 8.2, 8.3_

- [x] 14. Implement Buyer frontend pages
  - [x] 14.1 Create BuyerDashboard page
    - Display summary cards: total wishlist items, cart items, past orders
    - Display order history chart (Chart.js line/bar chart)
    - Fetch data from `/api/dashboard/buyer`
    - Show loading spinner while fetching, error message with retry on failure
    - _Requirements: 3.1, 6.1, 8.1, 8.2, 8.3_
  - [x] 14.2 Create ProductListing page
    - Display all products with name, price, image placeholder
    - "Add to Wishlist" and "Add to Cart" buttons per product
    - Show confirmation on successful action
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 14.3 Create WishlistPage
    - Display wishlist items with product details
    - Remove from wishlist functionality
    - _Requirements: 3.3_
  - [x] 14.4 Create CartPage
    - Display cart items with name, price, quantity, line total
    - Show computed total price
    - "Purchase" button to create order and clear cart
    - _Requirements: 3.5, 3.6_
  - [x] 14.5 Create OrdersPage
    - Display order history with order details and items
    - _Requirements: 3.7_

- [x] 15. Implement Seller frontend pages
  - [x] 15.1 Create SellerDashboard page
    - Display summary cards: total products, products sold, total revenue
    - Display sales revenue chart (Chart.js line chart)
    - Fetch data from `/api/dashboard/seller`
    - _Requirements: 4.1, 6.2, 8.1, 8.2, 8.3_
  - [x] 15.2 Create SellerProducts page
    - Display table of seller's products with name, price, status, actions
    - "Edit" button opens pre-filled edit form
    - _Requirements: 4.2, 4.5, 4.6_
  - [x] 15.3 Create AddProductPage
    - Form with product name, description, price fields
    - Submit creates product via API
    - _Requirements: 4.3, 4.4_

- [x] 16. Implement Admin frontend pages
  - [x] 16.1 Create AdminDashboard page
    - Display summary cards: total users, total products, total orders
    - Display charts for user registrations and order volume over time
    - Fetch data from `/api/dashboard/admin`
    - _Requirements: 5.1, 6.3, 8.1, 8.2, 8.3_
  - [x] 16.2 Create AdminUsers page
    - Display user management table with username, role, account status
    - "Delete" button removes user via API
    - _Requirements: 5.2, 5.3_
  - [x] 16.3 Create AdminProducts page
    - Display product management table with name, seller, price, status
    - "Remove" button removes product via API
    - _Requirements: 5.4, 5.5_

- [x] 17. Checkpoint - Ensure frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Wire frontend and backend together
  - [x] 18.1 Configure Vite proxy for API requests during development
    - Add proxy config in `vite.config.js` to forward `/api` requests to backend
    - _Requirements: 9.1_
  - [x] 18.2 Add backend startup script and seed data utility
    - Create `backend/seed.js` to populate sample data for demo purposes (sample users, products)
    - Add npm scripts: `start`, `dev`, `seed`, `test`
    - _Requirements: 10.1_
  - [x] 18.3 Add frontend npm scripts and environment configuration
    - Configure API base URL via environment variable
    - Add npm scripts: `dev`, `build`, `test`, `preview`
    - _Requirements: 10.1_

- [x] 19. Final checkpoint - Ensure all tests pass and application runs end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend tests use Jest + supertest; frontend tests use Vitest + React Testing Library
- Property-based tests use fast-check with minimum 100 iterations
