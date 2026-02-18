import { useState, useEffect, useCallback } from 'react';
import type { ICustomer, ICustomerInput } from '../types';
import { customersAPI } from '../services/api';

export const useCustomers = (search?: string) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customersAPI.getAll({ search });
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const createCustomer = async (data: ICustomerInput) => {
    try {
      const newCustomer = await customersAPI.create(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const updateCustomer = async (id: string, data: Partial<ICustomerInput>) => {
    try {
      const updatedCustomer = await customersAPI.update(id, data);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? updatedCustomer : c))
      );
      return updatedCustomer;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customersAPI.delete(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
