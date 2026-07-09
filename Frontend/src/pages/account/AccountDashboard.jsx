import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        if (res.data.success) {
          const orders = res.data.data;
          const pending = orders.filter(o => ['pending', 'processing'].includes(o.orderStatus)).length;
          const completed = orders.filter(o => o.orderStatus === 'delivered').length;
          setStats({ total: orders.length, pending, completed });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark">
        Welcome, {user?.name}!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </p>

      {loading ? (
        <div className="text-center py-4 text-gold">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-surface-dark border border-black dark:border-white p-6 flex flex-col items-center justify-center rounded-lg shadow-sm">
            <Package className="h-8 w-8 text-gold mb-3" />
            <span className="text-3xl font-bold text-black dark:text-cream-dark">{stats.total}</span>
            <span className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">Total Orders</span>
          </div>
          
          <div className="bg-gray-50 dark:bg-surface-dark border border-black dark:border-white p-6 flex flex-col items-center justify-center rounded-lg shadow-sm">
            <Clock className="h-8 w-8 text-yellow-500 mb-3" />
            <span className="text-3xl font-bold text-black dark:text-cream-dark">{stats.pending}</span>
            <span className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">Pending Orders</span>
          </div>

          <div className="bg-gray-50 dark:bg-surface-dark border border-black dark:border-white p-6 flex flex-col items-center justify-center rounded-lg shadow-sm">
            <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
            <span className="text-3xl font-bold text-black dark:text-cream-dark">{stats.completed}</span>
            <span className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">Completed Orders</span>
          </div>
        </div>
      )}
      
      <div className="flex gap-4 flex-wrap">
        <Link to="/account/orders" className="btn-gold px-6 py-2 uppercase text-sm tracking-wider">
          View Orders
        </Link>
        <Link to="/account/profile" className="border border-black dark:border-white px-6 py-2 uppercase text-sm tracking-wider text-black dark:text-white hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-black transition-colors">
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default AccountDashboard;
