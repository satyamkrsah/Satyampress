import React, { useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PremiumCollection = lazy(() => import('./pages/PremiumCollection'));
const BestSellers = lazy(() => import('./pages/BestSellers'));
const NewArrivals = lazy(() => import('./pages/NewArrivals'));
const FeaturedProducts = lazy(() => import('./pages/FeaturedProducts'));
// Account Pages
const AccountLayout = lazy(() => import('./layouts/AccountLayout'));
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));
const AccountProfile = lazy(() => import('./pages/account/AccountProfile'));
const AccountOrders = lazy(() => import('./pages/account/AccountOrders'));
const AccountAddresses = lazy(() => import('./pages/account/AccountAddresses'));
const AccountUploads = lazy(() => import('./pages/account/AccountUploads'));
const AccountNotifications = lazy(() => import('./pages/account/AccountNotifications'));
const AccountWishlist = lazy(() => import('./pages/account/AccountWishlist'));
const AccountSettings = lazy(() => import('./pages/account/AccountSettings'));
// Admin
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-white text-black transition-colors duration-300 dark:bg-background-dark dark:text-cream-dark">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppFloatingButton />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
        <ThemeProvider>
          <CartProvider>
            <ProductProvider>
              <Router>
                <ScrollToTop />
                <Toaster position="top-right" />
                <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gold">Loading...</div>}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicLayout />}>
                      <Route index element={<Home />} />
                      <Route path="products" element={<Products />} />
                      <Route path="premium" element={<PremiumCollection />} />
                      <Route path="best-sellers" element={<BestSellers />} />
                      <Route path="new-arrivals" element={<NewArrivals />} />
                      <Route path="featured" element={<FeaturedProducts />} />
                      <Route path="product/:id" element={<ProductDetail />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="track-order" element={<TrackOrder />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="account" element={<AccountLayout />}>
                        <Route index element={<AccountDashboard />} />
                        <Route path="profile" element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="addresses" element={<AccountAddresses />} />
                        <Route path="uploads" element={<AccountUploads />} />
                        <Route path="notifications" element={<AccountNotifications />} />
                        <Route path="wishlist" element={<AccountWishlist />} />
                        <Route path="settings" element={<AccountSettings />} />
                      </Route>
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="media" element={<AdminMedia />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                </Suspense>
              </Router>
            </ProductProvider>
          </CartProvider>
        </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
