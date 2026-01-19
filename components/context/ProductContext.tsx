"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";

export interface Product {
  id: number | string;
  title: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  description: string;
  inStock: boolean;
  stockQuantity: number;
}

interface ProductContextType {
  product: Product | null;
  setProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const setProductContext = useCallback((product: Product) => {
    setProduct(product);
  }, []);

  const value = {
    product,
    setProduct,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
