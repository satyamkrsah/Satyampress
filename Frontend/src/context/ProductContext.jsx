import React, { createContext, useContext, useState, useMemo } from 'react';
import { products, categories } from '../data/products';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

const SALE_ITEMS = [
  { id: 'w1', originalPrice: 216 },
  { id: 'w3', originalPrice: 450 },
  { id: 'w5', originalPrice: 500 },
  { id: 'b5', originalPrice: 80 },
];

export const ProductProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(null);

  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const sale = SALE_ITEMS.find((s) => s.id === p.id);
      if (sale) {
        const salePrice = Math.round(p.price * 0.55);
        return { ...p, price: salePrice, originalPrice: sale.originalPrice };
      }
      return p;
    });
  }, []);

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
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, enrichedProducts]);

  const trendingProducts = useMemo(
    () => enrichedProducts.filter((p) => p.rating >= 4.6).slice(0, 12),
    [enrichedProducts]
  );

  const premiumCollection = useMemo(
    () => enrichedProducts.filter((p) => p.isPremium).slice(0, 8),
    [enrichedProducts]
  );

  const saleProducts = useMemo(
    () => enrichedProducts.filter((p) => p.originalPrice).slice(0, 8),
    [enrichedProducts]
  );

  return (
    <ProductContext.Provider
      value={{
        products: enrichedProducts,
        categories,
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
