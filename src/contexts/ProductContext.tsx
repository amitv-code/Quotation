"use client";

import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  addProducts: (newProducts: Product[]) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (updatedProduct: Product) => void;
  getProductById: (productId: string) => Product | undefined;
  clearProducts: () => void;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'invoiceflow_products';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error("Failed to load products from localStorage:", error);
      // Potentially clear corrupted storage
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) { // Only save to localStorage after initial load
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
      } catch (error) {
        console.error("Failed to save products to localStorage:", error);
      }
    }
  }, [products, loading]);

  const addProduct = (product: Product) => {
    setProducts((prevProducts) => {
      // Prevent duplicates by ID (or SKU)
      if (prevProducts.find(p => p.id === product.id || p.sku === product.sku)) {
        // Optionally, update if exists or throw error/show toast
        console.warn(`Product with ID ${product.id} or SKU ${product.sku} already exists.`);
        return prevProducts;
      }
      return [...prevProducts, product];
    });
  };
  
  const addProducts = (newProducts: Product[]) => {
    setProducts((prevProducts) => {
      const productsToAdd = newProducts.filter(
        (np) => !prevProducts.some((pp) => pp.sku === np.sku || pp.id === np.id) 
      );
      const updatedProducts = prevProducts.map(pp => {
        const existingNew = newProducts.find(np => np.sku === pp.sku || np.id === pp.id);
        return existingNew ? { ...pp, ...existingNew } : pp; // Update existing
      });
      return [...updatedProducts, ...productsToAdd];
    });
  };

  const removeProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    );
  };

  const getProductById = (productId: string) => {
    return products.find((product) => product.id === productId);
  };

  const clearProducts = () => {
    setProducts([]);
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, addProducts, removeProduct, updateProduct, getProductById, clearProducts, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
