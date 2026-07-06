import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon, trend, isCurrency }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">
        {isCurrency ? `₹${value?.toLocaleString('en-IN') || 0}` : value || 0}
      </h3>
      {trend && (
        <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
    <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
      {icon}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/orders/recent')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  // Mock data for charts
  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button 
          onClick={async () => {
             const res = await api.get('/admin/reports/sales', { responseType: 'blob' });
             const url = window.URL.createObjectURL(new Blob([res.data]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'sales_report.csv');
             document.body.appendChild(link);
             link.click();
             link.remove();
          }}
          className="btn-primary py-2 px-4 text-sm"
        >
          Export CSV Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={stats?.totalRevenue} 
          icon={<IndianRupee />} 
          isCurrency 
          trend={12}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders} 
          icon={<ShoppingCart />} 
          trend={8}
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers} 
          icon={<Users />} 
          trend={5}
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts} 
          icon={<Package />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
            <select className="border border-gray-200 rounded p-1 text-sm outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Panels */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Pending
                </span>
                <span className="font-semibold">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div> Completed
                </span>
                <span className="font-semibold">{stats?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div> Cancelled
                </span>
                <span className="font-semibold">{stats?.cancelledOrders || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 text-orange-600 mb-4">
               <AlertTriangle size={20} />
               <h2 className="text-lg font-bold">Low Stock Alerts</h2>
             </div>
             <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.lowStockProducts || 0}</p>
             <p className="text-sm text-gray-500">Products need restocking</p>
             <button className="mt-4 text-sm text-gold font-medium hover:underline">View Inventory →</button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <button className="text-sm text-gold font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{order.invoiceNumber}</td>
                  <td className="px-6 py-4">{order.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">₹{order.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'}`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
