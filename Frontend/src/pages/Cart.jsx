import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSummary, loading } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300 py-10 px-4 text-center">
        <div className="bg-white dark:bg-background-dark transition-colors duration-300 p-10 md:p-14 max-w-lg w-full border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
          <div className="h-20 w-20 bg-gold/10 flex items-center justify-center mx-auto mb-6 text-gold">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-3 text-black dark:text-cream-dark">Your cart is empty</h2>
          <p className="text-black dark:text-white mb-8 text-sm">
            Browse our collections and add premium printing products to your cart.
          </p>
          <Link to="/products" className="btn-gold inline-flex w-full justify-center">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300 py-10 px-4 text-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <p className="section-subheading mb-2">Your Order</p>
        <h1 className="section-heading mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow">
            <div className="bg-white dark:bg-background-dark transition-colors duration-300 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 overflow-hidden">
              <div className="p-5 border-b border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 hidden sm:grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-black dark:text-white">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-1 text-right">Remove</div>
              </div>

              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  return (
                  <motion.li
                    key={item._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative"
                  >
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden bg-white dark:bg-black transition-colors duration-300 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
                        <img src={product.images ? product.images[0] : (product.image || 'no-photo.jpg')} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs text-gold uppercase tracking-wider mb-1">{product.category?.name || product.category}</span>
                        <Link to={`/product/${product._id}`} className="font-serif text-black dark:text-cream-dark hover:text-gold transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <div className="text-xs text-black dark:text-white mt-1 opacity-70">
                            {Object.values(item.customizations).filter(Boolean).join(', ')}
                          </div>
                        )}
                        <div className="sm:hidden font-semibold text-gold mt-2">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block col-span-2 text-center font-semibold text-gold">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </div>

                    <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center items-center">
                      <div className="flex items-center border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 h-10">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 text-black dark:text-white hover:text-gold h-full"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 text-black dark:text-white hover:text-gold h-full"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="absolute sm:relative top-5 right-5 sm:top-auto sm:right-auto sm:col-span-1 text-right">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                )})}
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white dark:bg-background-dark transition-colors duration-300 p-6 md:p-8 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 sticky top-36">
              <h2 className="font-serif text-xl font-semibold mb-6 text-black dark:text-cream-dark">Order Summary</h2>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-black dark:text-white">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span className="font-semibold text-black dark:text-cream-dark">
                    ₹{cartSummary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-black dark:text-white">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-black dark:text-cream-dark">
                    ₹{cartSummary.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-black dark:text-white pb-4 border-b border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {cartSummary.deliveryCharge === 0 ? (
                      <span className="text-gold">Free</span>
                    ) : (
                      `₹${cartSummary.deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold pt-2 text-black dark:text-cream-dark">
                  <span>Total</span>
                  <span className="text-gold">
                    ₹{cartSummary.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-black dark:text-white text-center mb-6">Free delivery on orders above ₹1,000</p>

              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 h-12 mb-4">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-black dark:text-white">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
