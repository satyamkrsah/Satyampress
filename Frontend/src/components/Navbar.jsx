import React, { useState } from "react";
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
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProduct } from "../context/ProductContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { categories } from "../data/products";
import AnnouncementBar from "./AnnouncementBar";
import logo from "../assets/satyam4.svg";

const Navbar = () => {
  const { cartSummary } = useCart();
  const { searchQuery, setSearchQuery } = useProduct();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

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
                <button
                  onClick={logout}
                  className="p-2 text-black dark:text-cream-dark hover:text-gold transition-colors hidden sm:block flex items-center"
                  aria-label="Logout"
                  title={`Logged in as ${user?.name}`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
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
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 text-sm font-medium uppercase tracking-wider text-black dark:text-cream-dark dark:text-black dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
                >
                  Logout ({user?.name})
                </button>
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
