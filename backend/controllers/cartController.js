const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to calculate totals
const calculateCartTotals = async (cart) => {
  let subTotal = 0;
  let taxTotal = 0;

  for (const item of cart.items) {
    // Get product to get the gst rate
    const product = await Product.findById(item.product);
    const gstRate = product ? product.gstRate : 18;
    
    const itemTotal = item.price * item.quantity;
    subTotal += itemTotal;
    
    // Calculate GST assuming price is exclusive of GST (as is standard in B2B printing)
    const itemTax = (itemTotal * gstRate) / 100;
    taxTotal += itemTax;
  }

  cart.subTotal = subTotal;
  cart.taxTotal = taxTotal;
  
  // Basic shipping logic: ₹100 flat rate if subtotal < ₹2000, else free
  cart.shippingTotal = subTotal > 2000 ? 0 : 100;
  
  // Calculate discount if coupon exists
  cart.discountTotal = 0;
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.isActive && new Date() <= coupon.validUntil && subTotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        let discount = (subTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        cart.discountTotal = discount;
      } else if (coupon.discountType === 'fixed') {
        cart.discountTotal = coupon.discountValue;
      }
    } else {
      // Coupon invalid or expired, remove it
      cart.coupon = null;
    }
  }

  cart.grandTotal = subTotal + taxTotal + cart.shippingTotal - cart.discountTotal;
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name thumbnail image images gallery category basePrice price gstRate minQuantity deliveryDays',
        populate: [
          { path: 'thumbnail', select: 'secureUrl url originalName' },
          { path: 'gallery', select: 'secureUrl url originalName' }
        ]
      })
      .populate('coupon', 'code discountType discountValue');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    let { product, quantity, customizations, designFile, specialInstructions } = req.body;

    if (designFile === "") {
        designFile = undefined;
    }

    const dbProduct = await Product.findById(product)
      .populate('category')
      .populate('thumbnail')
      .populate('gallery');
    if (!dbProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Calculate final price based on basePrice and customizations
    let finalPrice = dbProduct.basePrice || 0;
    
    // Check if category has dynamic customizations
    if (customizations && dbProduct.category && dbProduct.category.customizationFields) {
      for (const [key, val] of Object.entries(customizations)) {
        const field = dbProduct.category.customizationFields.find(f => f.name === key);
        if (field && field.options) {
          const opt = field.options.find(o => o.name === val);
          if (opt && opt.priceModifier) {
            finalPrice += opt.priceModifier;
          }
        }
      }
    } else if (customizations && dbProduct.customizations) {
      // Backward compatibility for old hardcoded products
      const map = {
        paperSize: 'paperSizes',
        paperGsm: 'paperGsm',
        paperType: 'paperTypes',
        colorOption: 'colorOptions',
        lamination: 'lamination',
        cornerFinish: 'cornerFinish',
        binding: 'binding'
      };
      for (const [key, val] of Object.entries(customizations)) {
        const schemaKey = map[key];
        if (schemaKey && dbProduct.customizations[schemaKey]) {
          const opt = dbProduct.customizations[schemaKey].find(o => o.name === val);
          if (opt && opt.priceModifier) {
            finalPrice += opt.priceModifier;
          }
        }
      }
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Since printing products have unique customizations, we might just add it as a new item 
    // instead of merging quantities, but for simplicity, let's see if an EXACT identical configuration exists
    const itemIndex = cart.items.findIndex(p => 
      p.product.toString() === product && 
      JSON.stringify(p.customizations) === JSON.stringify(customizations)
    );

    if (itemIndex > -1) {
      // Product exists with same config, update quantity
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = finalPrice; // Update price just in case
    } else {
      // Product does not exist or different config, add new item
      cart.items.push({
        product,
        name: dbProduct.name,
        image: dbProduct.thumbnail?.secureUrl || dbProduct.thumbnail?.url || "",
        quantity,
        price: finalPrice,
        customizations,
        designFile: designFile || undefined, // Matches schema field name
        specialInstructions
      });
    }

    cart = await calculateCartTotals(cart);
    await cart.save();
    cart = await Cart.findById(cart._id)
  .populate(
    'items.product',
    'name thumbnail image images gallery category basePrice price gstRate minQuantity deliveryDays'
  )
  .populate('coupon', 'code discountType discountValue');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(p => p._id.toString() === req.params.itemId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      
      cart = await calculateCartTotals(cart);
      await cart.save();
      
      return res.status(200).json({ success: true, data: cart });
    } else {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    
    cart = await calculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    if (!code) {
      // Remove coupon
      cart.coupon = null;
      cart = await calculateCartTotals(cart);
      await cart.save();
      return res.status(200).json({ success: true, data: cart });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, error: 'Invalid coupon code' });
    }

    if (new Date() > coupon.validUntil) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }

    if (cart.subTotal < coupon.minOrderValue) {
      return res.status(400).json({ success: false, error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` });
    }

    cart.coupon = coupon._id;
    cart = await calculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};
