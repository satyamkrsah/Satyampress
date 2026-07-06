const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon
} = require('../controllers/cartController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes are protected

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.post('/coupon', applyCoupon);

module.exports = router;
