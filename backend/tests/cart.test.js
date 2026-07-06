const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const cartRoutes = require('../routes/cartRoutes');
const { createTestUser } = require('./testUtils');
const errorHandler = require('../middleware/errorMiddleware');

const app = express();
app.use(express.json());
app.use('/api/cart', cartRoutes);
app.use(errorHandler);

describe('Cart API', () => {
  it('should get empty cart', async () => {
    const { token } = await createTestUser('customer');
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(0);
  });
});
