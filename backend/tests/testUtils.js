const mongoose = require('mongoose');
const User = require('../models/User');

exports.createTestUser = async (role = 'customer') => {
  const user = await User.create({
    name: 'Test ' + role,
    email: `${role}${Date.now()}@test.com`,
    password: 'password123',
    role: role
  });

  const token = user.getSignedJwtToken();
  return { user, token };
};
