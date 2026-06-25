import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <ProductProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-white text-black">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </main>
                <Footer />
                <WhatsAppFloatingButton />
              </div>
            </Router>
          </ProductProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
