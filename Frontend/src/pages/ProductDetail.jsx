import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Truck, Upload, ArrowLeft } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProduct();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    setQuantity(1);
    setFileUploaded(false);
  }, [id]);

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
            className="overflow-hidden bg-white dark:bg-black transition-colors duration-300 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300"
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
                <span className="font-medium text-sm">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-black dark:text-white text-sm">{product.reviews} Reviews</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-gold">
                ₹{product.price.toLocaleString('en-IN')}
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

            <div className="mb-8 p-6 bg-white dark:bg-black transition-colors duration-300 border border-dashed border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="h-5 w-5 text-gold" />
                <h3 className="font-serif font-semibold text-black dark:text-cream-dark">Upload Your Design</h3>
              </div>
              <p className="text-sm text-black dark:text-white mb-4">Supported: PDF, AI, PSD, CDR, High-res JPG/PNG</p>
              <label className="btn-outline w-full flex cursor-pointer justify-center text-sm">
                <span>{fileUploaded ? 'Design Uploaded — Change File?' : 'Choose File'}</span>
                <input type="file" className="hidden" onChange={() => setFileUploaded(true)} />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 h-12 w-32 shrink-0">
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
                onClick={() => addToCart(product, quantity)}
                className="btn-gold flex-1 h-12 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300">
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
