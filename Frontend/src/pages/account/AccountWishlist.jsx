import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Heart, Trash2, ShoppingCart, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const AccountWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/auth/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/auth/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.data);
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">
        My Wishlist
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-surface-dark border border-dashed border-gray-300 dark:border-gray-700">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
          <Link to="/products" className="inline-block mt-4 btn-gold px-6 py-2 uppercase text-xs tracking-wider">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="border border-black dark:border-white p-4 flex flex-col group bg-white dark:bg-black">
              <Link to={`/product/${product._id}`} className="block h-48 overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                <img 
                  src={product.images?.[0] || '/placeholder.png'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="flex-grow">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-serif font-semibold text-black dark:text-white truncate">{product.name}</h3>
                </Link>
                <p className="text-gold font-bold mt-1">₹{product.price}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 btn-gold py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" /> Add
                </button>
                <button 
                  onClick={() => removeFromWishlist(product._id)}
                  className="px-3 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountWishlist;
