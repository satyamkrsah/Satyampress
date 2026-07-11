import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { priceRanges } from '../data/homeData';

const BestSellers = () => {
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const [res, catRes] = await Promise.all([
           api.get('/products/best-sellers'),
           api.get('/categories').catch(() => ({ data: { data: [] } }))
        ]);
        
        let fetchedProducts = res.data?.data || [];
        fetchedProducts = fetchedProducts.map((p) => {
          const currentPrice = p.basePrice || p.price;
          const categoryName = p.category && typeof p.category === "object" ? p.category.name : p.category;
          const formatted = { ...p, price: currentPrice, categoryName };
          if (p.offerPrice) {
            return { ...formatted, price: p.offerPrice, originalPrice: currentPrice };
          }
          return formatted;
        });

        setProducts(fetchedProducts);
        
        let fetchedCategories = catRes.data?.data?.map((c) => c.name) || [];
        setCategories(["All", ...fetchedCategories]);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams, categories]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.categoryName === selectedCategory);
    }
    if (priceRange) {
      result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    }
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(lowerQuery) || p.categoryName?.toLowerCase().includes(lowerQuery));
    }
    return result;
  }, [products, searchQuery, selectedCategory, priceRange]);

  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="mb-10 text-center">
          <p className="section-subheading mb-2">Popular</p>
          <h1 className="section-heading">Best Sellers</h1>
          <p className="text-black dark:text-white mt-3 max-w-xl mx-auto">
            Browse our most popular and highly rated printing products.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setPriceRange(null)}
            className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
              !priceRange
                ? 'border-black bg-black text-white'
                : 'border-black dark:border-white transition-colors duration-300 bg-white dark:bg-background-dark text-black dark:text-cream-dark hover:border-gold hover:text-gold'
            }`}
          >
            All Prices
          </button>
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(range)}
              className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                priceRange?.label === range.label
                  ? 'border-gold bg-gold text-black dark:text-cream-dark font-semibold'
                  : 'border-black dark:border-white transition-colors duration-300 bg-white dark:bg-background-dark text-black dark:text-cream-dark hover:border-gold hover:text-gold'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-56 shrink-0">
            <div className="bg-white dark:bg-background-dark transition-colors duration-300 p-5 border border-black dark:border-white transition-colors duration-300 sticky top-36">
              <div className="flex items-center gap-2 mb-5 font-medium text-sm uppercase tracking-wider text-black dark:text-cream-dark">
                <Filter className="h-4 w-4 text-gold" /> Filters
              </div>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-background-dark transition-colors duration-300 border border-black dark:border-white text-sm focus:outline-none focus:ring-1 focus:ring-gold text-black dark:text-cream-dark"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-black dark:text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-black dark:text-white mb-3">Categories</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          selectedCategory === cat
                            ? 'bg-black text-white font-medium'
                            : 'text-black dark:text-white hover:text-gold'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {(searchQuery || priceRange || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange(null);
                    setSelectedCategory('All');
                  }}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-black dark:text-cream-dark hover:text-gold py-2 border border-black dark:border-white transition-colors duration-300 hover:border-gold"
                >
                  <X className="h-3 w-3" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 text-gold animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
                Error loading products: {error}
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-black dark:text-white">
                  Showing {filteredProducts.length} products
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="product-grid">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-background-dark transition-colors duration-300 p-16 text-center border border-black dark:border-white transition-colors duration-300">
                    <Search className="h-10 w-10 text-black dark:text-white mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-black dark:text-cream-dark mb-2">No products found</h3>
                    <p className="text-black dark:text-white mb-6 text-sm">Try adjusting your search or filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange(null);
                        setSelectedCategory('All');
                      }}
                      className="btn-outline inline-block text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
