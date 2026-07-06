# Testing Guide

Satyam Printing Press relies on an automated testing suite to guarantee API reliability and prevent regressions.

## 1. Testing Stack
- **Framework:** Jest
- **Assertion/Requests:** Supertest
- **Database Mocking:** `mongodb-memory-server`

## 2. Architecture
The project utilizes `mongodb-memory-server` to spin up an ephemeral, in-memory MongoDB instance during the test run. This ensures that tests run rapidly and do not corrupt the local development or production databases.
- The global setup is configured in `backend/tests/setup.js`.
- It dynamically provisions the mock URI, establishes the Mongoose connection, seeds necessary test environment variables (like `JWT_SECRET`), and drops collections after every test suite to maintain data isolation.

## 3. Running Tests
To execute the backend test suite and generate a coverage report:
```bash
cd backend
npm run test -- --coverage
```

## 4. Test Suites Implemented
- `auth.test.js`: Validates registration constraints (duplicate emails) and successful login JWT generation.
- `cart.test.js`: Validates protected cart retrieval using mocked JWT tokens.
- `order.test.js`: Validates the retrieval of customer-specific order history.
- `payment.test.js`: Validates Razorpay integration error handling (e.g., missing order payload scenarios resulting in 404).
- `admin.test.js`: Validates RBAC rules by generating an `admin` role token and testing protected dashboard analytics and customer retrieval routes.

## 5. Adding New Tests
When creating a new route:
1. Create a `.test.js` file in `backend/tests/`.
2. Import `{ createTestUser }` from `tests/testUtils.js`.
3. Use `createTestUser('customer')` or `createTestUser('admin')` to dynamically generate a test account and its signed JWT Bearer token.
4. Pass the token in the `Authorization` header via Supertest.
