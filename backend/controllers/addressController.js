const Address = require('../models/Address');

// @desc    Get logged in user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // If this is set as default shipping, unset others
    if (req.body.isDefaultShipping) {
      await Address.updateMany({ user: req.user.id }, { isDefaultShipping: false });
    }
    
    // If this is set as default billing, unset others
    if (req.body.isDefaultBilling) {
      await Address.updateMany({ user: req.user.id }, { isDefaultBilling: false });
    }

    const address = await Address.create(req.body);

    res.status(201).json({
      success: true,
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // Make sure user owns the address
    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this address' });
    }

    if (req.body.isDefaultShipping) {
      await Address.updateMany({ user: req.user.id, _id: { $ne: req.params.id } }, { isDefaultShipping: false });
    }
    
    if (req.body.isDefaultBilling) {
      await Address.updateMany({ user: req.user.id, _id: { $ne: req.params.id } }, { isDefaultBilling: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this address' });
    }

    await address.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
