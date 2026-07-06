import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, cartSummary, cartData, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    fetchAddresses();
  }, [cartItems, navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          const defaultAddr = res.data.data.find(a => a.isDefaultShipping) || res.data.data[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses', error);
    }
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const saveNewAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/addresses', { ...newAddress, isDefaultShipping: true, isDefaultBilling: true });
      if (res.data.success) {
        toast.success('Address saved!');
        setAddresses([...addresses, res.data.data]);
        setSelectedAddressId(res.data.data._id);
        setShowNewAddressForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }
    
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        shippingAddress: selectedAddressId,
        billingAddress: selectedAddressId,
        paymentMethod: paymentMethod,
        orderNotes: 'Please ensure careful packaging.'
      });

      if (orderRes.data.success) {
        const orderId = orderRes.data.data._id;
        
        if (paymentMethod === 'cod') {
          toast.success('Order placed successfully (COD)!');
          clearCart();
          navigate('/profile/orders');
          return;
        }

        // Online Payment Flow
        const res = await loadRazorpayScript();
        if (!res) {
          toast.error('Razorpay SDK failed to load');
          setLoading(false);
          return;
        }

        const paymentRes = await api.post('/payments/create-order', { orderId });
        if (!paymentRes.data.success) {
          toast.error('Failed to initialize payment');
          setLoading(false);
          return;
        }

        const options = {
          key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkey',
          amount: paymentRes.data.data.amount,
          currency: paymentRes.data.data.currency,
          name: 'Satyam Printing Press',
          description: 'Payment for your order',
          order_id: paymentRes.data.data.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              if (verifyRes.data.success) {
                toast.success('Payment successful and order confirmed!');
                clearCart();
                navigate('/profile/orders');
              }
            } catch (err) {
              toast.error('Payment verification failed');
              navigate('/profile/orders');
            }
          },
          prefill: {
            name: newAddress.fullName || 'Customer',
            email: 'customer@example.com',
            contact: newAddress.phoneNumber || '9999999999'
          },
          theme: { color: '#BF953F' }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          toast.error('Payment failed. You can retry from your orders page.');
          clearCart();
          navigate('/profile/orders');
        });
        
        paymentObject.open();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-3xl font-serif font-semibold mb-8 text-black dark:text-cream-dark">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-grow space-y-8">
            
            {/* Address Section */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="h-6 w-6 text-gold" />
                <h2 className="text-xl font-serif font-semibold text-black dark:text-cream-dark">Shipping Address</h2>
              </div>

              {addresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4 mb-6">
                  {addresses.map(addr => (
                    <label key={addr._id} className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-gold bg-gold/5' : 'border-black dark:border-white'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        className="mt-1 text-gold focus:ring-gold"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div>
                        <p className="font-semibold text-black dark:text-white">{addr.fullName}</p>
                        <p className="text-sm text-black dark:text-white opacity-80 mt-1">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="text-sm text-black dark:text-white opacity-80">Phone: {addr.phoneNumber}</p>
                      </div>
                    </label>
                  ))}
                  <button 
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-gold text-sm font-semibold hover:underline mt-2 inline-block"
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {(showNewAddressForm || addresses.length === 0) && (
                <form onSubmit={saveNewAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">Full Name</label>
                      <input type="text" name="fullName" required value={newAddress.fullName} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">Phone Number</label>
                      <input type="text" name="phoneNumber" required value={newAddress.phoneNumber} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">Street Address</label>
                      <input type="text" name="street" required value={newAddress.street} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">City</label>
                      <input type="text" name="city" required value={newAddress.city} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">State</label>
                      <input type="text" name="state" required value={newAddress.state} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-black dark:text-white mb-1">ZIP Code</label>
                      <input type="text" name="zipCode" required value={newAddress.zipCode} onChange={handleAddressChange} className="w-full p-3 border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:border-gold" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={loading} className="btn-gold">
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => setShowNewAddressForm(false)} className="btn-outline">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-gold" />
                <h2 className="text-xl font-serif font-semibold text-black dark:text-cream-dark">Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-gold bg-gold/5' : 'border-black dark:border-white'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    className="mt-1 text-gold focus:ring-gold"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white flex items-center gap-2">
                      Online Payment 
                      {paymentMethod === 'online' && <CheckCircle2 className="h-4 w-4 text-gold" />}
                    </p>
                    <p className="text-sm text-black dark:text-white opacity-80 mt-1">
                      Pay securely via UPI, Credit/Debit Card, or Netbanking (Razorpay)
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-black dark:border-white'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    className="mt-1 text-gold focus:ring-gold"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white flex items-center gap-2">
                      Cash on Delivery (COD)
                      {paymentMethod === 'cod' && <CheckCircle2 className="h-4 w-4 text-gold" />}
                    </p>
                    <p className="text-sm text-black dark:text-white opacity-80 mt-1">
                      Pay when your order is delivered to your address
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white dark:bg-black border border-black dark:border-white p-6 md:p-8 sticky top-36">
              <h2 className="font-serif text-xl font-semibold mb-6 text-black dark:text-cream-dark">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-black dark:text-white line-clamp-1 w-2/3">
                      {item.quantity}x {item.product?.name || 'Product'}
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-black dark:border-white text-sm">
                <div className="flex justify-between text-black dark:text-white">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{cartSummary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-black dark:text-white">
                  <span>GST</span>
                  <span className="font-semibold">₹{cartSummary.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {cartSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{cartSummary.discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-black dark:text-white pb-4 border-b border-black dark:border-white">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {cartSummary.deliveryCharge === 0 ? <span className="text-gold">Free</span> : `₹${cartSummary.deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-semibold pt-2 text-black dark:text-cream-dark">
                  <span>Total</span>
                  <span className="text-gold">₹{cartSummary.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <button 
                onClick={placeOrder} 
                disabled={loading || !selectedAddressId}
                className="btn-primary w-full flex items-center justify-center gap-2 h-12 mt-8 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'} <ChevronRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-black dark:text-white mt-4">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Secure Checkout Process</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
