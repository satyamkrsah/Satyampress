import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

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
          api.get('/products').catch(() => ({ data: { data: [] }})),
          api.get('/categories').catch(() => ({ data: { data: [] }}))
        ]);

        let fetchedProducts = productsRes.data?.data || [];
        let fetchedCategories = categoriesRes.data?.data?.map(c => c.name) || [];

        setProducts(fetchedProducts);
        setCategories(["All", ...fetchedCategories]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setProducts([]);
        setCategories(["All"]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const pId = p._id;
      const currentPrice = p.basePrice || p.price;
      const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;

      const formattedProduct = {
        ...p,
        _id: pId,
        id: pId, // Keep id for any legacy components not yet updated, but primarily use _id
        price: currentPrice,
        category: categoryName || p.category
      };

      if (p.offerPrice) {
        return { ...formattedProduct, price: p.offerPrice, originalPrice: currentPrice };
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
