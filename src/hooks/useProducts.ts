import { useState, useEffect, useCallback } from 'react';
import type { IProduct, IProductInput } from '../types';
import { productsAPI } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = async (data: IProductInput) => {
    try {
      const newProduct = await productsAPI.create(data);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const updateProduct = async (id: string, data: Partial<IProductInput>) => {
    try {
      const updatedProduct = await productsAPI.update(id, data);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
