import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Truck, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading, error } = useProduct();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [designFile, setDesignFile] = useState(null);
  const [customizations, setCustomizations] = useState({
    paperSize: 'A4',
    paperGsm: '130 GSM',
    colorOption: 'Full Color',
    lamination: 'None',
  });
  const [livePrice, setLivePrice] = useState(0);

  const product = products.find((p) => p._id === id || p.id === id);

  useEffect(() => {
    setQuantity(1);
    setDesignFile(null);
    if (product) {
      setLivePrice(product.price);
    }
  }, [id, product]);

  // Simple mock live price calculation
  useEffect(() => {
    if (product) {
      let extra = 0;
      if (customizations.paperSize === 'A3') extra += 50;
      if (customizations.paperGsm === '300 GSM') extra += 20;
      if (customizations.lamination === 'Gloss') extra += 15;
      if (customizations.lamination === 'Matte') extra += 20;
      setLivePrice(product.price + extra);
    }
  }, [customizations, product]);

  const handleCustomizationChange = (e) => {
    setCustomizations(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddToCart = () => {
    if (!designFile) {
      toast.error('Please upload your design file before adding to cart.');
      return;
    }

    addToCart(product, quantity, customizations, livePrice, designFile._id);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
          Error loading product: {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black dark:text-cream-dark">Product Not Found</h2>
          <Link to="/products" className="btn-primary inline-flex">Back to Products</Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <Link to="/products" className="inline-flex items-center text-black dark:text-white hover:text-gold mb-8 transition-colors text-sm uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden bg-white dark:bg-black transition-colors duration-300 border border-black dark:border-white transition-colors duration-300"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-black dark:text-cream-dark mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium text-sm">{product.rating?.toFixed(1) || '4.5'}</span>
              </div>
              <span className="text-black dark:text-white text-sm">{product.reviews || 12} Reviews</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-gold">
                ₹{livePrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-black dark:text-white line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs uppercase tracking-wider bg-black text-white px-2 py-1">
                    Sale
                  </span>
                </>
              )}
              <span className="text-sm text-black dark:text-white">/ piece</span>
            </div>

            <p className="text-black dark:text-white mb-8 leading-relaxed">
              Experience the highest quality printing with our {product.name}. Perfect for your custom needs,
              featuring premium materials, rich colors, and exquisite detailing.
            </p>

            {/* Customizations Form */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-black dark:text-white mb-1">Paper Size</label>
                <select 
                  name="paperSize" 
                  value={customizations.paperSize} 
                  onChange={handleCustomizationChange}
                  className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-sm focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="A4">A4 (Standard)</option>
                  <option value="A5">A5 (Half)</option>
                  <option value="A3">A3 (Large) +₹50</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-black dark:text-white mb-1">Paper GSM</label>
                <select 
                  name="paperGsm" 
                  value={customizations.paperGsm} 
                  onChange={handleCustomizationChange}
                  className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-sm focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="100 GSM">100 GSM (Economy)</option>
                  <option value="130 GSM">130 GSM (Standard)</option>
                  <option value="300 GSM">300 GSM (Premium) +₹20</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-black dark:text-white mb-1">Color Option</label>
                <select 
                  name="colorOption" 
                  value={customizations.colorOption} 
                  onChange={handleCustomizationChange}
                  className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-sm focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="Full Color">Full Color</option>
                  <option value="Black & White">Black & White</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-black dark:text-white mb-1">Lamination</label>
                <select 
                  name="lamination" 
                  value={customizations.lamination} 
                  onChange={handleCustomizationChange}
                  className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-sm focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="None">None</option>
                  <option value="Gloss">Gloss +₹15</option>
                  <option value="Matte">Matte +₹20</option>
                </select>
              </div>
            </div>

            {/* Design Upload Section */}
            <div className="pt-6 mb-8 border-t border-black dark:border-white">
              <h3 className="font-serif text-lg font-semibold mb-4 text-black dark:text-cream-dark">Upload Design</h3>
              <FileUpload 
                onUploadSuccess={(media) => setDesignFile(media)} 
                uploadType="design_file" 
              />
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black dark:border-white">
              <div className="flex items-center border border-black dark:border-white transition-colors duration-300 h-12 w-32 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-black dark:text-white hover:text-gold h-full"
                >
                  -
                </button>
                <span className="flex-1 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 text-black dark:text-white hover:text-gold h-full"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-gold flex-1 h-12 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black dark:border-white transition-colors duration-300">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-black dark:text-cream-dark">Quality Guarantee</h4>
                  <p className="text-xs text-black dark:text-white">100% satisfaction promised</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-black dark:text-cream-dark">Fast Delivery</h4>
                  <p className="text-xs text-black dark:text-white">Ships within 2-3 days</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
