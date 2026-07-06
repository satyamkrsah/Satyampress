const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('../routes/orderRoutes');
const { createTestUser } = require('./testUtils');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);



describe('Order API', () => {
  it('should get my orders (empty initially)', async () => {
    const { token } = await createTestUser('customer');
    const res = await request(app)
      .get('/api/orders/myorders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
