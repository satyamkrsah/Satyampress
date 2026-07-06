import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

const SALE_ITEMS = [
  { id: 'w1', originalPrice: 216 },
  { id: 'w3', originalPrice: 450 },
  { id: 'w5', originalPrice: 500 },
  { id: 'b5', originalPrice: 80 },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(null);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products').catch(() => ({ data: { data: fallbackProducts }})),
          api.get('/categories').catch(() => ({ data: { data: [] }}))
        ]);

        let fetchedProducts = productsRes.data.data;
        let fetchedCategories = categoriesRes.data.data.map(c => c.name);

        // If backend has no data yet, use fallback data for smooth transition
        if (!fetchedProducts || fetchedProducts.length === 0) {
          fetchedProducts = fallbackProducts;
        }
        if (!fetchedCategories || fetchedCategories.length === 0) {
          fetchedCategories = fallbackCategories.filter(c => c !== "All");
        }

        setProducts(fetchedProducts);
        setCategories(["All", ...fetchedCategories]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        // Fallback
        setProducts(fallbackProducts);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      // Handle both API format and local format for ID
      const pId = p._id || p.id;
      const sale = SALE_ITEMS.find((s) => s.id === pId);
      
      // Calculate price (handling backend format where price might be basePrice)
      const currentPrice = p.basePrice || p.price;
      const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;

      const formattedProduct = {
        ...p,
        id: pId,
        price: currentPrice,
        category: categoryName || p.category
      };

      if (sale) {
        const salePrice = Math.round(currentPrice * 0.55);
        return { ...formattedProduct, price: salePrice, originalPrice: sale.originalPrice };
      }
      return formattedProduct;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = enrichedProducts;

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (priceRange) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max
      );
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(lowerQuery) ||
          p.category?.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, enrichedProducts]);

  const trendingProducts = useMemo(
    () => enrichedProducts.filter((p) => p.rating >= 4.6 || p.isFeatured).slice(0, 12),
    [enrichedProducts]
  );

  const premiumCollection = useMemo(
    () => enrichedProducts.filter((p) => p.isPremium || p.isBestSeller).slice(0, 8),
    [enrichedProducts]
  );

  const saleProducts = useMemo(
    () => enrichedProducts.filter((p) => p.originalPrice || p.offerPrice).slice(0, 8),
    [enrichedProducts]
  );

  return (
    <ProductContext.Provider
      value={{
        products: enrichedProducts,
        categories,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        filteredProducts,
        trendingProducts,
        premiumCollection,
        saleProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
