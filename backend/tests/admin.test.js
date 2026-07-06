const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('../routes/adminRoutes');
const { createTestUser } = require('./testUtils');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);



describe('Admin API', () => {
  it('should get dashboard stats', async () => {
    const { token } = await createTestUser('admin');
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalOrders');
  });

  it('should get recent orders', async () => {
    const { token } = await createTestUser('admin');
    const res = await request(app)
      .get('/api/admin/orders/recent')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  
  it('should get customers', async () => {
    const { token } = await createTestUser('admin');
    const res = await request(app)
      .get('/api/admin/customers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
