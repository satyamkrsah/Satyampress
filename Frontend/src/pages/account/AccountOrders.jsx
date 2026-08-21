import React, { useState, useEffect } from 'react';
import { Package, Clock, XCircle, ChevronRight, Download, Truck, CheckCircle2, Image as ImageIcon, FileText, ExternalLink, Eye, File, ZoomIn } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        toast.error("Razorpay Key is missing");
        return;
      }

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

      console.log("Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);
      console.log("Payment Response:", paymentRes.data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
            
            console.log("Verify Response:", verifyRes.data);
            
            if (verifyRes.data.success) {
              toast.success('Payment successful and order confirmed!');
              // Refresh orders
              const res2 = await api.get('/orders/myorders');
              if (res2.data.success) setOrders(res2.data.data);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: order.user?.phone || ''
        },
        notes: {
          orderId: order._id
        },
        theme: { color: '#BF953F' },
        retry: {
          enabled: true
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        }
      };

      console.log("Razorpay Options:", options);

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.log("Payment Failed Response:", response);
        toast.error('Payment failed');
      });
      paymentObject.open();
    } catch (error) {
      toast.error('Failed to process retry');
    }
  };

  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async (orderId, invoiceNumber) => {
    setDownloading(true);
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        toast.success('Order cancelled successfully');
        setOrders(orders.map(o => o._id === orderId ? res.data.data : o));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
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
                        <img 
                          src={item.product?.thumbnail?.secureUrl || item.product?.gallery?.[0]?.secureUrl || '/placeholder.png'} 
                          alt={item.product?.name || item.name} 
                          className="h-full w-full object-cover" 
                        />
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

                {/* Customer Uploaded Designs Section */}
                {order.items.some(item => item.designFile) && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-gray-400" /> Your Uploaded Designs
                    </h4>
                    <div className="space-y-4">
                      {order.items.filter(item => item.designFile).map((item, idx) => {
                        const df = item.designFile;
                        const isImage = df.mimeType?.startsWith('image/');
                        const isPdf = df.mimeType === 'application/pdf';
                        
                        return (
                          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="sm:w-1/4 shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800 relative group p-2 min-h-[120px]">
                                {isImage ? (
                                  <>
                                    <img src={df.secureUrl} alt={df.originalName} className="max-h-24 object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <a href={df.secureUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white rounded-full hover:bg-gray-100 text-gray-900" title="Zoom">
                                        <ZoomIn className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </>
                                ) : isPdf ? (
                                  <FileText className="h-10 w-10 text-red-500 mb-1" />
                                ) : (
                                  <File className="h-10 w-10 text-gray-400 mb-1" />
                                )}
                              </div>
                              <div className="sm:w-3/4 flex flex-col justify-center">
                                <span className="text-xs uppercase text-gold font-medium">{item.name}</span>
                                <h5 className="text-sm font-semibold text-black dark:text-white mt-1 line-clamp-1">{df.originalName}</h5>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex gap-4">
                                  <span>{formatBytes(df.size)}</span>
                                  <span>{new Date(df.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <a href={df.secureUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded hover:bg-gray-800 transition-colors">
                                    {isPdf ? <Eye className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                                    View
                                  </a>
                                  <button onClick={() => {
                                    toast.loading('Starting download...', { id: 'dl' });
                                    fetch(df.secureUrl).then(res => res.blob()).then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = df.originalName;
                                      link.click();
                                      toast.success('Download complete', { id: 'dl' });
                                    }).catch(() => toast.error('Download failed', { id: 'dl' }));
                                  }} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
                                    <Download className="h-3 w-3" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                 <div className="mt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                   <div className="flex gap-2">
                     {order.paymentMethod === 'online' && (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') ? (
                       <button 
                         onClick={() => handleRetryPayment(order)}
                         className="btn-gold px-4 py-1.5 text-xs h-auto"
                       >
                         Retry Payment
                       </button>
                     ) : null}
                     
                     <button 
                       onClick={() => handleDownloadInvoice(order._id, order.invoiceNumber)}
                       disabled={downloading}
                       className="px-4 py-1.5 text-xs h-auto border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 disabled:opacity-50"
                     >
                       <Download className="h-3 w-3" /> Invoice
                     </button>
                   </div>
                   
                   <div className="flex gap-3">
                     {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                       <button 
                         onClick={() => handleCancelOrder(order._id)}
                         className="text-xs uppercase tracking-wider text-red-500 font-semibold hover:underline"
                       >
                         Cancel Order
                       </button>
                     )}
                     <button 
                       onClick={() => setTrackingOrderId(trackingOrderId === order._id ? null : order._id)}
                       className="text-xs uppercase tracking-wider text-gold font-semibold hover:underline flex items-center gap-1"
                     >
                       {trackingOrderId === order._id ? 'Hide Tracking' : 'Track Order'} <ChevronRight className={`h-4 w-4 transition-transform ${trackingOrderId === order._id ? 'rotate-90' : ''}`} />
                     </button>
                   </div>
                 </div>

                 {/* Tracking Timeline */}
                 <AnimatePresence>
                   {trackingOrderId === order._id && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                         <h4 className="font-semibold text-black dark:text-white mb-4">Order Timeline</h4>
                         {order.orderStatus === 'cancelled' ? (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                              <XCircle className="h-6 w-6" />
                              <div>
                                <p className="font-semibold">Order Cancelled</p>
                                <p className="text-sm mt-1">{order.cancelReason || 'Cancelled by user'}</p>
                              </div>
                            </div>
                         ) : (
                           <div className="space-y-4">
                             {order.timeline.map((event, idx) => (
                               <div key={idx} className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                     <div className="h-2.5 w-2.5 bg-gold rounded-full ring-4 ring-gold/20 mt-1.5"></div>
                                     {idx !== order.timeline.length - 1 && <div className="w-px h-full bg-gray-200 dark:bg-gray-700 my-2"></div>}
                                  </div>
                                  <div className="pb-4">
                                     <p className="font-semibold text-gray-900 dark:text-white capitalize">{event.status.replace(/_/g, ' ')}</p>
                                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.note}</p>
                                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(event.date).toLocaleString()}</p>
                                  </div>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AccountOrders;
