import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subTotal: 0, taxTotal: 0, shippingTotal: 0, discountTotal: 0, grandTotal: 0, coupon: null });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], subTotal: 0, taxTotal: 0, shippingTotal: 0, discountTotal: 0, grandTotal: 0, coupon: null });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.data) {
        setCart(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, customizations = {}, price, designFile = '', specialInstructions = '') => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      const res = await api.post('/cart/add', {
        product: product.id || product._id,
        quantity,
        price: price || product.price,
        customizations,
        designFile,
        specialInstructions
      });
      
      if (res.data.success) {
        setCart(res.data.data);
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.data.success) {
        setCart(res.data.data);
        toast.success('Item removed');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      if (res.data.success) {
        setCart(res.data.data);
        toast.success('Coupon applied!');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.post('/cart/coupon', { code: null });
      if (res.data.success) {
        setCart(res.data.data);
        toast.success('Coupon removed');
      }
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  };

  const clearCart = () => setCart({ items: [], subTotal: 0, taxTotal: 0, shippingTotal: 0, discountTotal: 0, grandTotal: 0, coupon: null });

  // Map backend cart structure to frontend expected structure for easier migration
  const cartSummary = useMemo(() => {
    return {
      subtotal: cart.subTotal || 0,
      gstAmount: cart.taxTotal || 0,
      deliveryCharge: cart.shippingTotal || 0,
      discount: cart.discountTotal || 0,
      total: cart.grandTotal || 0,
      itemCount: cart.items ? cart.items.reduce((count, item) => count + item.quantity, 0) : 0
    };
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cartItems: cart.items || [],
      cartData: cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart,
      cartSummary,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
