import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, CheckCircle, Clock, Package, 
  Truck, CheckCircle2, XCircle, CreditCard, User, MapPin,
  Image as ImageIcon, FileText, ExternalLink, Copy, Eye, ZoomIn, File
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading order details...</div>;
  if (!order) return null;

  const statusFlow = ['pending', 'confirmed', 'printing', 'packed', 'shipped', 'delivered'];
  const currentStatusIndex = statusFlow.indexOf(order.orderStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.invoiceNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Downloading...' : 'Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Timeline (Status Machine) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Workflow</h2>
            
            {order.orderStatus === 'cancelled' ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Order Cancelled</p>
                  <p className="text-sm text-red-500 mt-1">Reason: {order.cancelReason || 'Cancelled by user'}</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block rounded-full"></div>
                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-4 sm:gap-0">
                  {statusFlow.map((status, index) => {
                    const isCompleted = currentStatusIndex >= index;
                    const isCurrent = currentStatusIndex === index;
                    
                    return (
                      <div key={status} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                        <button
                          onClick={() => handleStatusChange(status)}
                          disabled={index <= currentStatusIndex || index > currentStatusIndex + 1}
                          className={`
                            h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${isCompleted ? 'bg-gold border-gold text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}
                            ${index === currentStatusIndex + 1 ? 'hover:border-gold hover:text-gold cursor-pointer ring-4 ring-gold/10' : 'cursor-not-allowed'}
                            ${isCurrent ? 'ring-4 ring-gold/30 scale-110' : ''}
                          `}
                          title={index === currentStatusIndex + 1 ? `Click to mark as ${status}` : ''}
                        >
                          {index === 0 && <Clock className="h-4 w-4" />}
                          {index === 1 && <CheckCircle className="h-4 w-4" />}
                          {index === 2 && <Package className="h-4 w-4" />}
                          {index === 3 && <Package className="h-4 w-4" />}
                          {index === 4 && <Truck className="h-4 w-4" />}
                          {index === 5 && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-lg">Product</th>
                    <th className="px-4 py-3 font-medium">Customizations</th>
                    <th className="px-4 py-3 font-medium text-right">Price</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden shrink-0">
                             <img 
                               src={item.product?.thumbnail?.secureUrl || item.product?.gallery?.[0]?.secureUrl || '/placeholder.png'} 
                               alt={item.product?.name || item.name} 
                               className="h-full w-full object-cover" 
                             />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                            {item.specialInstructions && <p className="text-xs text-gray-500 mt-1 line-clamp-1">Note: {item.specialInstructions}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.customizations ? (
                          <div className="text-xs text-gray-600 space-y-1">
                            {Object.entries(item.customizations).map(([k, v]) => (
                               <div key={k}><span className="font-medium text-gray-800 capitalize">{k}:</span> {v}</div>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-4 text-right">₹{item.price.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span>₹{Math.round(order.taxTotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{order.shippingTotal.toLocaleString()}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-gold">₹{Math.round(order.grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Uploaded Designs Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-400" /> Customer Uploaded Designs
            </h2>
            
            {order.items.some(item => item.designFile) ? (
              <div className="space-y-6">
                {order.items.filter(item => item.designFile).map((item, idx) => {
                  const df = item.designFile;
                  const isImage = df.mimeType?.startsWith('image/');
                  const isPdf = df.mimeType === 'application/pdf';
                  
                  return (
                    <div key={idx} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-6">
                        
                        {/* Preview Area */}
                        <div className="sm:w-1/3 shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative group p-4 min-h-[200px]">
                          {isImage ? (
                            <>
                              <img src={df.secureUrl} alt={df.originalName} className="max-h-48 object-contain" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <a href={df.secureUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-900" title="Zoom / Open">
                                  <ZoomIn className="h-5 w-5" />
                                </a>
                              </div>
                            </>
                          ) : isPdf ? (
                            <div className="flex flex-col items-center justify-center text-red-500">
                              <FileText className="h-16 w-16 mb-2" />
                              <span className="font-medium text-sm text-gray-600">PDF Document</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <File className="h-16 w-16 mb-2" />
                              <span className="font-medium text-sm text-gray-600">Unknown Format</span>
                            </div>
                          )}
                        </div>

                        {/* Details Area */}
                        <div className="sm:w-2/3 flex flex-col justify-center">
                          <div className="mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded-md">
                              {item.name}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-medium text-gray-900 mt-2 line-clamp-1" title={df.originalName}>
                            {df.originalName}
                          </h3>
                          
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <p className="flex justify-between border-b border-gray-50 pb-2">
                              <span>Uploaded:</span>
                              <span className="font-medium text-gray-900">{new Date(df.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </p>
                            <p className="flex justify-between border-b border-gray-50 pb-2">
                              <span>File Size:</span>
                              <span className="font-medium text-gray-900">{formatBytes(df.size)}</span>
                            </p>
                            <p className="flex justify-between items-center border-b border-gray-50 pb-2">
                              <span>Cloudinary ID:</span>
                              <span className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="truncate max-w-[120px] sm:max-w-xs">{df.publicId}</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(df.publicId);
                                    toast.success('Copied to clipboard');
                                  }}
                                  className="text-gray-400 hover:text-gold"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </span>
                            </p>
                          </div>
                          
                          <div className="mt-6 flex flex-wrap gap-3">
                            <a 
                              href={df.secureUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              {isPdf ? <Eye className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                              {isPdf ? 'View PDF' : 'Open Full'}
                            </a>
                            <button
                              onClick={() => {
                                toast.loading('Starting download...', { id: 'dl' });
                                fetch(df.secureUrl)
                                  .then(res => res.blob())
                                  .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = df.originalName;
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast.success('Download complete', { id: 'dl' });
                                  })
                                  .catch(() => toast.error('Download failed', { id: 'dl' }));
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <File className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No Design Uploaded Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">This order does not contain any customer uploaded design files.</p>
              </div>
            )}
          </div>

          {/* Detailed Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Status History</h2>
             <div className="space-y-6">
                {order.timeline.map((event, idx) => (
                   <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                         <div className="h-3 w-3 bg-gold rounded-full ring-4 ring-gold/20 mt-1.5"></div>
                         {idx !== order.timeline.length - 1 && <div className="w-px h-full bg-gray-200 my-2"></div>}
                      </div>
                      <div className="pb-6">
                         <p className="font-semibold text-gray-900 capitalize">{event.status.replace(/_/g, ' ')}</p>
                         <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                         <p className="text-xs text-gray-400 mt-2">{new Date(event.date).toLocaleString()}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" /> Customer
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{order.user?.name || 'Guest User'}</p>
                <p className="text-gray-500">{order.user?.email}</p>
                {order.user?.phone && <p className="text-gray-500">{order.user?.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" /> Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p className="pt-2">Phone: {order.shippingAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address provided.</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" /> Payment Details
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus.replace('_', ' ')}
                </span>
              </div>
              {order.paymentDetails?.razorpayPaymentId && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium text-gray-900 text-xs truncate max-w-[150px]">{order.paymentDetails.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
