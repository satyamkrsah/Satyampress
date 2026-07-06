const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const paymentRoutes = require('../routes/paymentRoutes');
const { createTestUser } = require('./testUtils');

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);



describe('Payment API', () => {
  it('should fail to create order with no amount', async () => {
    const { token } = await createTestUser('customer');
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toEqual(404); // Expecting 404 since order is not found
  });
});
