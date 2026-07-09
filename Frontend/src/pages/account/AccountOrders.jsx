import React, { useState, useEffect } from 'react';
import { Package, Clock, XCircle, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const handleRetryPayment = async (order) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const paymentRes = await api.post('/payments/create-order', { orderId: order._id });
      if (!paymentRes.data.success) {
        toast.error('Failed to initialize payment');
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
              // Refresh orders
              const res2 = await api.get('/orders/myorders');
              if (res2.data.success) setOrders(res2.data.data);
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: order.user?.name || 'Customer',
          email: order.user?.email || 'customer@example.com'
        },
        theme: { color: '#BF953F' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function () {
        toast.error('Payment failed again.');
      });
      paymentObject.open();
    } catch (error) {
      toast.error('Failed to process retry');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gold" />;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-black border border-black dark:border-white p-8 text-center">
            <Package className="h-12 w-12 text-black dark:text-white mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-serif font-semibold text-black dark:text-cream-dark mb-2">No orders found</h3>
            <p className="text-sm text-black dark:text-white opacity-70">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white dark:bg-black border border-black dark:border-white p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black dark:border-white pb-4 mb-4 gap-4">
                  <div>
                    <span className="text-xs text-black dark:text-white uppercase tracking-wider block mb-1">
                      Order #{order.invoiceNumber}
                    </span>
                    <span className="text-sm text-black dark:text-white opacity-80">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.orderStatus)}
                    <span className="text-sm font-semibold capitalize text-black dark:text-white">
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gold block">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-black dark:text-white uppercase tracking-wider">
                      {order.items.length} Items
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 shrink-0">
                        <img src={item.image || 'no-photo.jpg'} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-serif text-sm font-semibold text-black dark:text-white">{item.name}</h4>
                        <p className="text-xs text-black dark:text-white opacity-70 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold text-black dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between items-center">
                   {order.paymentMethod === 'online' && (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') ? (
                     <button 
                       onClick={() => handleRetryPayment(order)}
                       className="btn-gold px-4 py-1.5 text-xs h-auto"
                     >
                       Retry Payment
                     </button>
                   ) : (
                     <div></div>
                   )}
                   <button className="text-xs uppercase tracking-wider text-gold font-semibold hover:underline flex items-center gap-1">
                     View Details <ChevronRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AccountOrders;
