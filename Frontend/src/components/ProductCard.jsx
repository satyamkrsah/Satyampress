import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, compact = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div whileHover={{ y: -4 }} className="group flex flex-col h-full relative cursor-pointer">
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-[24px] border border-black/10 dark:border-white/10 aspect-[4/5] bg-black/5 dark:bg-white/5">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {/* Badges */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 z-10 bg-[#222] dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.isPremium && !hasDiscount && (
            <span className="absolute top-3 left-3 z-10 bg-gold text-black text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide shadow-md">
              Premium
            </span>
          )}

          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Bottom Right Cutout & Button */}
        <div className="absolute -bottom-[1px] -right-[1px] w-[56px] h-[56px] bg-white dark:bg-background-dark rounded-tl-[24px] border-t border-l border-black/10 dark:border-white/10 z-10 flex items-end justify-end p-[5px]">
          <button
            onClick={handleAddToCart}
            className="w-[44px] h-[44px] bg-[#222] dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-110 hover:bg-gold dark:hover:bg-gold transition-all shadow-md"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Text Section (Outside the image) */}
      <div className={`flex flex-col flex-grow pt-4 ${compact ? 'px-1' : 'px-2'}`}>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-sans text-black dark:text-white hover:text-gold transition-colors line-clamp-1 font-semibold ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1.5">
          {hasDiscount ? (
            <>
              <span className="text-sm text-black/40 dark:text-white/40 line-through font-medium">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className={`font-bold text-black dark:text-white ${compact ? 'text-sm' : 'text-[17px]'}`}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className={`font-bold text-black dark:text-white ${compact ? 'text-sm' : 'text-[17px]'}`}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
