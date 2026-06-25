import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ products, title, subtitle, viewAllLink = '/products', noSection = false }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!products?.length) return null;

  const Content = (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          {subtitle && <p className="section-subheading mb-2">{subtitle}</p>}
          <h2 className="section-heading">{title}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            className="p-2 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 text-black dark:text-cream-dark hover:border-gold hover:text-gold transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 border border-black dark:border-white dark:border-black dark:border-white transition-colors duration-300 text-black dark:text-cream-dark hover:border-gold hover:text-gold transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] snap-start">
            <ProductCard product={product} compact />
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to={viewAllLink} className="btn-outline inline-block text-sm">
          View All
        </Link>
      </div>
    </div>
  );

  if (noSection) {
    return Content;
  }

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-background-dark transition-colors duration-300">
      {Content}
    </section>
  );
};

export default ProductCarousel;
