import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Heart,
  User,
  Moon,
  Sun,
  LogOut,
  Bell,
  Settings,
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  CreditCard,
  Image as ImageIcon,
  Users,
  Grid
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProduct } from "../context/ProductContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

import AnnouncementBar from "./AnnouncementBar";
import logo from "../assets/satyam4.svg";

const Navbar = () => {
  const { cartSummary } = useCart();
  const { searchQuery, setSearchQuery } = useProduct();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/products");
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Product", to: "/products" },
    { label: "Track Order", to: "/track-order" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <nav className="glass sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Left Side */}
            <Link to="/" className="z-10 shrink-0">
              <img
                src={logo}
                alt="Satyam Printing Press"
                className="h-12 md:h-16 w-auto"
              />
            </Link>

            {/* Links - Center (Desktop) */}
            <div className="hidden md:flex justify-center items-center gap-6 lg:gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-xs uppercase tracking-[0.15em] font-medium text-black dark:text-cream-dark dark:text-black dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions - Right Side */}
            <div className="flex items-center gap-1 md:gap-3 z-10">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-black dark:text-cream-dark hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-black dark:text-cream-dark hover:text-gold dark:hover:text-gold transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button
                className="p-2 text-black dark:text-cream-dark hover:text-gold transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 text-black dark:text-cream-dark hover:text-gold transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-black dark:border-white shadow-xl z-50">
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="font-semibold text-black dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-gold hover:underline">
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notif => (
                              <div key={notif._id} 
                                className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-black transition-colors ${!notif.isRead ? 'bg-gold/10' : ''}`}
                                onClick={() => markAsRead(notif._id)}
                              >
                                <p className="text-sm font-medium text-black dark:text-white">{notif.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                          )}
                        </div>
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                          <Link to="/account/notifications" onClick={() => setIsNotificationOpen(false)} className="text-xs text-gold hover:underline">
                            View All
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Dropdown */}
                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="p-1 sm:p-2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gold text-white font-semibold uppercase text-xs sm:text-sm hover:bg-black hover:text-gold dark:hover:bg-white transition-colors ml-2 object-cover overflow-hidden border border-transparent"
                      aria-label="User Menu"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : user?.name ? (
                        user.name.substring(0, 2)
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-black dark:border-white shadow-xl z-50">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-bold text-black dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' ? (
                            <>
                              <Link to="/admin/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                              </Link>
                              <Link to="/admin/products" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <ShoppingBag className="w-4 h-4 mr-3" /> Products
                              </Link>
                              <Link to="/admin/categories" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <Grid className="w-4 h-4 mr-3" /> Categories
                              </Link>
                              <Link to="/admin/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <ShoppingCart className="w-4 h-4 mr-3" /> Orders
                              </Link>
                              <Link to="/admin/customers" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <Users className="w-4 h-4 mr-3" /> Customers
                              </Link>
                              <Link to="/admin/payments" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <CreditCard className="w-4 h-4 mr-3" /> Payments
                              </Link>
                              <Link to="/admin/media" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <ImageIcon className="w-4 h-4 mr-3" /> Media
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link to="/account" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                              </Link>
                              <Link to="/account/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <User className="w-4 h-4 mr-3" /> My Profile
                              </Link>
                              <Link to="/account/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <ShoppingBag className="w-4 h-4 mr-3" /> My Orders
                              </Link>
                              <Link to="/account/addresses" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <MapPin className="w-4 h-4 mr-3" /> My Addresses
                              </Link>
                              <Link to="/account/wishlist" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <Heart className="w-4 h-4 mr-3" /> Wishlist
                              </Link>
                              <Link to="/account/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gold/10">
                                <Settings className="w-4 h-4 mr-3" /> Settings
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                          <button onClick={() => { setIsUserMenuOpen(false); logout(); navigate('/'); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                            <LogOut className="w-4 h-4 mr-3" /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-black dark:text-cream-dark hover:text-gold transition-colors hidden sm:block"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              <Link
                to="/cart"
                className="relative p-2 text-black dark:text-cream-dark hover:text-gold transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartSummary.itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gold text-black dark:text-cream-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartSummary.itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-black dark:text-cream-dark hover:text-gold transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar Dropdown */}
          {isSearchOpen && (
            <div className="pb-4 animate-fade-in">
              <form
                onSubmit={handleSearchSubmit}
                className="relative max-w-lg mx-auto"
              >
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-surface-dark border border-black dark:border-white dark:border-black dark:border-white text-sm focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-white transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white hover:text-gold"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-background-dark border-t border-black dark:border-white dark:border-black dark:border-white animate-fade-in transition-colors duration-300">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 text-sm font-medium uppercase tracking-wider text-black dark:text-cream-dark dark:text-black dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Login / Logout */}
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/account'}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-3 py-3 text-sm font-medium uppercase tracking-wider text-black dark:text-cream-dark dark:text-black dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
                >
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 text-sm font-medium uppercase tracking-wider text-black dark:text-cream-dark dark:text-black dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
                >
                  Login
                </Link>
              )}

              <div className="border-t border-black dark:border-white dark:border-black dark:border-white pt-3 mt-3">
                <p className="px-3 py-2 text-xs uppercase tracking-wider text-black dark:text-white dark:text-black dark:text-white">
                  Categories
                </p>
                {categories
                  .filter((c) => c !== "All")
                  .map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 pl-6 text-sm text-black dark:text-white dark:text-black dark:text-white hover:text-gold dark:hover:text-gold"
                    >
                      {cat}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
