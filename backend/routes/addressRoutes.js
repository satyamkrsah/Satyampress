const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route('/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

module.exports = router;
