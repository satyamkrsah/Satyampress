import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import ProductCarousel from '../components/ProductCarousel';
import ProductCard from '../components/ProductCard';
import ProcessSteps from '../components/ProcessSteps';
import TestimonialsSection from '../components/TestimonialsSection';
import { heroSlides, homeCategories, curatedCollections, priceRanges } from '../data/homeData';

const Home = () => {
  const { products, trendingProducts, saleProducts, premiumCollection, setPriceRange } = useProduct();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-white dark:bg-background-dark transition-colors duration-300">
      {/* Hero */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 text-center px-6 py-12 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-gold text-sm md:text-base uppercase tracking-[0.4em] mb-4 font-semibold drop-shadow-md">
                {heroSlides[currentSlide].subtitle}
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-lg">
                {heroSlides[currentSlide].title1}
                <br />
                <span className="italic text-gold font-medium">{heroSlides[currentSlide].title2}</span>
              </h1>
              <Link to="/products" className="btn-gold inline-block mt-6">
                Explore Collection
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-gold' : 'w-4 bg-white hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="py-16 md:py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="section-subheading mb-3">Collections</p>
            <h2 className="section-heading">Shop by Collection</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {homeCategories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-square rounded-full overflow-hidden mb-5 mx-auto w-4/5 sm:w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 transition-colors duration-300">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-base md:text-lg text-black dark:text-cream-dark group-hover:text-gold transition-colors mb-1">
                    {cat.name.replace(' Printing', '')}
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-black dark:text-white group-hover:text-gold transition-colors inline-flex items-center gap-1">
                    Explore Collection <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="section-subheading mb-2">Our Catalogue</p>
              <h2 className="section-heading">Explore All Cards</h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex btn-outline text-sm">
              View All
            </Link>
          </div>

          <div className="product-grid">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="btn-outline inline-block text-sm">
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-16 md:py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="section-subheading mb-3">Curated</p>
            <h2 className="section-heading">Curated for Grand Celebrations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curatedCollections.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group relative aspect-[16/9] md:aspect-[2/1] overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">{item.title}</h3>
                  <p className="text-white text-sm mb-4">{item.subtitle}</p>
                  <span className="text-gold text-sm uppercase tracking-wider inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Price */}
      <section className="py-16 md:py-20 bg-white dark:bg-black transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-10">
            <p className="section-subheading mb-3">Budget Friendly</p>
            <h2 className="section-heading">Shop by Price</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {priceRanges.map((range) => (
              <Link
                key={range.label}
                to="/products"
                onClick={() => setPriceRange(range)}
                className="px-6 py-3 border border-black dark:border-white dark:border-black dark:border-white bg-white dark:bg-background-dark text-sm font-medium text-black dark:text-cream-dark hover:border-gold hover:text-gold dark:hover:text-gold transition-all duration-300"
              >
                {range.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Collection */}
      <section className="py-16 md:py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="section-subheading mb-3">Exclusive</p>
            <h2 className="section-heading">Premium Collection</h2>
          </div>

          <div className="product-grid">
            {premiumCollection.slice(0, 5).map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="aspect-square overflow-hidden bg-white dark:bg-black border border-black dark:border-white dark:border-black dark:border-white mb-3 transition-colors duration-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-sm text-black dark:text-cream-dark group-hover:text-gold transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gold font-semibold text-sm mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/products" className="btn-gold inline-block">
              Shop Premium
            </Link>
          </div>
        </div>
      </section>

      <ProcessSteps />
      <TestimonialsSection />
    </div>
  );
};

export default Home;
