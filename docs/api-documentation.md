# API Documentation

The backend is built with Express.js and provides RESTful endpoints. All APIs interacting with user data require a valid JWT token sent in the `Authorization: Bearer <token>` header. Admin endpoints require a user to have the `role: 'admin'` assigned in MongoDB.

## 1. Authentication Routes (`/api/auth`)
- `POST /register`: Register a new user (Customer by default).
- `POST /login`: Authenticate user and receive a JWT token.
- `GET /me`: Get current authenticated user profile. (Protected)

## 2. Product Routes (`/api/products`)
- `GET /`: List all products (with pagination and search filters).
- `GET /:id`: Fetch a specific product by ID.
- `POST /`: Create a new product. (Admin only)
- `PUT /:id`: Update product details. (Admin only)
- `DELETE /:id`: Delete a product. (Admin only)

## 3. Category Routes (`/api/categories`)
- `GET /`: List all categories (hierarchical tree structure).
- `POST /`: Create a new category. (Admin only)
- `PUT /:id`: Update an existing category. (Admin only)
- `DELETE /:id`: Delete a category. (Admin only)

## 4. Cart Routes (`/api/cart`)
- `GET /`: Get current user's shopping cart and calculate real-time totals. (Protected)
- `POST /add`: Add a customized product to the cart. (Protected)
- `PUT /:itemId`: Update quantity of a cart item. (Protected)
- `DELETE /:itemId`: Remove an item from the cart. (Protected)
- `POST /coupon`: Apply or remove a discount coupon. (Protected)

## 5. Order Routes (`/api/orders`)
- `POST /`: Create a new order from the cart data. (Protected)
- `GET /myorders`: Get all orders belonging to the logged-in user. (Protected)
- `GET /:id`: Get specific order details. (Protected)
- `PUT /:id/cancel`: Cancel an order (Allowed if pending/confirmed). (Protected)
- `GET /admin/all`: Get all store orders. (Admin only)
- `PUT /:id/status`: Update order fulfillment status. (Admin only)

## 6. Payment Routes (`/api/payments`)
- `POST /create-order`: Generates a Razorpay Order ID for frontend checkout. (Protected)
- `POST /verify`: Verifies Razorpay signature, captures payment, and updates order status. (Protected)
- `GET /`: Get all payment transactions. (Admin only)
- `POST /:id/refund`: Initiate a full or partial refund for a completed transaction via Razorpay. (Admin only)

## 7. Upload Routes (`/api/upload`)
- `POST /image`: Upload product images to Cloudinary. Returns secure URLs. (Admin only)
- `POST /document`: Upload customer printing design PDFs/Assets to Cloudinary. (Protected)

## 8. Admin Customers Routes (`/api/admin/customers`)
- `GET /`: Fetch list of all customers. (Admin only)
- `PUT /:id/status`: Toggle user status (Block / Active). (Admin only)
- `DELETE /:id`: Delete a customer record. (Admin only)

## 9. Global Settings Routes (`/api/settings`)
- `GET /`: Fetch global store settings (logo, address, SEO defaults). (Public)
- `PUT /`: Update global store settings. (Admin only)

## 10. System Health (`/api/health`)
- `GET /`: Basic API heartbeat. Returns environment status and timestamp.
