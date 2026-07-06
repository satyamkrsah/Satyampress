import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RefreshCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    const confirmRefund = window.confirm('Are you sure you want to initiate a full refund for this payment?');
    if (!confirmRefund) return;

    try {
      const res = await api.post(`/payments/${paymentId}/refund`);
      if (res.data.success) {
        toast.success('Refund initiated successfully');
        fetchPayments(); // Refresh list to get updated status
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate refund');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded': return <RefreshCcw className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) return <div>Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Refunds</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search by Payment ID, Order ID, or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Payment ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Refund Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{payment.paymentId}</p>
                    <p className="text-xs text-gray-500">{payment.razorpayOrderId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{payment.customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{payment.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{payment.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(payment.paymentStatus)}
                      <span className="capitalize">{payment.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`capitalize text-xs font-semibold px-2 py-1 rounded ${
                      payment.refundStatus === 'full' ? 'bg-blue-100 text-blue-700' :
                      payment.refundStatus === 'partial' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {payment.refundStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.paymentStatus === 'completed' && payment.refundStatus !== 'full' ? (
                      <button 
                        onClick={() => handleRefund(payment._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
