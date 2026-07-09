import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  IndianRupee, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Loader
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon, isCurrency }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">
        {isCurrency ? `₹${value?.toLocaleString('en-IN') || 0}` : value || 0}
      </h3>
    </div>
    <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
      {icon}
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
    <div className="w-full mr-4">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0"></div>
  </div>
);

const AdminDashboard = () => {
  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      if (!res.data.success) throw new Error('Failed to load stats');
      return res.data.data;
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: 1
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Unable to load dashboard</h2>
        <p className="text-gray-500 mt-2">Please check your connection or try again later.</p>
      </div>
    );
  }

  const exportReport = async () => {
    try {
      const toastId = toast.loading('Generating report...');
      const res = await api.get('/admin/reports/sales', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button 
          onClick={exportReport}
          className="btn-primary py-2 px-4 text-sm"
        >
          Export CSV Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              title="Total Revenue" 
              value={statsData?.totalRevenue} 
              icon={<IndianRupee />} 
              isCurrency 
            />
            <StatCard 
              title="Total Orders" 
              value={statsData?.totalOrders} 
              icon={<ShoppingCart />} 
            />
            <StatCard 
              title="Total Customers" 
              value={statsData?.totalCustomers} 
              icon={<Users />} 
            />
            <StatCard 
              title="Total Products" 
              value={statsData?.totalProducts} 
              icon={<Package />} 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Weekly Revenue Analytics</h2>
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
          </div>
          <div className="h-72 w-full mt-auto">
            {isLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                 <Loader className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : statsData?.weeklySales?.every(day => day.sales === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                 <TrendingUp className="w-10 h-10 text-gray-300 mb-2" />
                 <p className="text-gray-500 font-medium">No sales data for this week</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData?.weeklySales || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280'}}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    labelStyle={{color: '#111827', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="sales" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Small Panels */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Pending
                  </span>
                  <span className="font-bold text-yellow-900">{statsData?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="flex items-center gap-2 text-sm font-medium text-green-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Completed
                  </span>
                  <span className="font-bold text-green-900">{statsData?.completedOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="flex items-center gap-2 text-sm font-medium text-red-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Cancelled
                  </span>
                  <span className="font-bold text-red-900">{statsData?.cancelledOrders || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
             <div className="flex items-center gap-2 text-orange-600 mb-4">
               <AlertTriangle size={20} />
               <h2 className="text-lg font-bold text-gray-900">Low Stock Alerts</h2>
             </div>
             
             {isLoading ? (
               <div className="space-y-3 mt-auto">
                 <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                 <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
               </div>
             ) : statsData?.lowStockProducts?.length === 0 ? (
               <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
                  <Package className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-600">Inventory looks good!</p>
                  <p className="text-xs text-gray-400 mt-1">No products are low on stock.</p>
               </div>
             ) : (
               <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2">
                 {statsData?.lowStockProducts.map(product => (
                   <div key={product._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                     <span className="font-medium text-gray-700 truncate pr-2 flex-1" title={product.name}>{product.name}</span>
                     <span className="text-orange-600 font-bold shrink-0">{product.stock} left</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
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
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                  </tr>
                ))
              ) : statsData?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No recent orders found.</p>
                  </td>
                </tr>
              ) : (
                statsData?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{order.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{order.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap
                        ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
