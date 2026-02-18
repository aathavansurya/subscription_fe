import { useState, useEffect, useCallback } from 'react';
import type { IPayment, IPaymentInput, IPaymentUpdateInput } from '../types';
import { paymentsAPI } from '../services/api';

export const usePayments = (filters?: {
  customer?: string;
  product?: string;
  month?: number;
  year?: number;
  status?: 'paid' | 'unpaid' | 'pending';
}) => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentsAPI.getAll(filters);
      setPayments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [filters?.customer, filters?.product, filters?.month, filters?.year, filters?.status]);

  const createPayment = async (data: IPaymentInput) => {
    try {
      const newPayment = await paymentsAPI.create(data);
      setPayments((prev) => [newPayment, ...prev]);
      return newPayment;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const updatePayment = async (id: string, data: IPaymentUpdateInput) => {
    try {
      const updatedPayment = await paymentsAPI.update(id, data);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? updatedPayment : p))
      );
      return updatedPayment;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await paymentsAPI.delete(id);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const markAsPaid = async (id: string, amount?: number) => {
    try {
      const updatedPayment = await paymentsAPI.markAsPaid(id, amount);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? updatedPayment : p))
      );
      return updatedPayment;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    isLoading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
  };
};

export const useOverduePayments = () => {
  const [overduePayments, setOverduePayments] = useState<IPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverduePayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentsAPI.getOverdue();
      setOverduePayments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch overdue payments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverduePayments();
  }, [fetchOverduePayments]);

  return {
    overduePayments,
    isLoading,
    error,
    fetchOverduePayments,
  };
};
