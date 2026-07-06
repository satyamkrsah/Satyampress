# Security Guide

Satyam Printing Press incorporates multiple layers of security to protect customer data, business financials, and infrastructure.

## 1. Authentication & Authorization (RBAC)
- **JSON Web Tokens (JWT)**: Upon successful login, users receive a signed JWT. This token is mandated for all protected API routes via the `protect` middleware.
- **Role-Based Access Control**: Administrative routes are shielded by the `authorize('admin')` middleware. Even if a regular customer attempts to access `/api/admin` routes with a valid token, the request will be rejected with a 403 Forbidden status.
- **Password Hashing**: Plain text passwords are never stored. The `User` Mongoose model implements a `pre('save')` hook that automatically hashes passwords using `bcryptjs` with a salt round of 10.

## 2. API Security
- **Express-Mongo-Sanitize**: All incoming `req.body`, `req.query`, and `req.params` are parsed to remove keys starting with `$` or `.`. This prevents malicious NoSQL injection attacks that could bypass authentication.
- **XSS-Clean**: This middleware sanitizes incoming requests to prevent Cross-Site Scripting (XSS) attacks.
- **Helmet**: Secures HTTP headers by configuring Content Security Policy (CSP), disabling `X-Powered-By`, and enforcing strict transport security.
- **Rate Limiting**: Protects against brute-force and DDoS attacks. The global rate limiter is configured to allow a maximum of 1000 requests per 15 minutes per IP.

## 3. Financial Integrity (Razorpay)
- The system employs cryptographic HMAC SHA256 signature verification.
- When the frontend claims a successful payment, the backend computes the expected signature using the Razorpay Secret Key and the Order ID.
- The order status and inventory counts are **only** updated if the signatures match perfectly, completely mitigating the risk of spoofed client-side payment success payloads.

## 4. File Upload Validation
- The Multer middleware is configured to strictly allow only permitted MIME types (e.g., `application/pdf`, `image/png`, `image/jpeg`).
- Executable files or scripts are rejected immediately.
- Files are piped directly to Cloudinary and not stored permanently on the Express server filesystem.
