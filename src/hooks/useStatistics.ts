import { useState, useEffect, useCallback } from 'react';
import type { IDashboardStats, IMonthlyStats, IProductStats } from '../types';
import { statisticsAPI } from '../services/api';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statisticsAPI.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, fetchStats };
};

export const useMonthlyStats = (year?: number) => {
  const [monthlyStats, setMonthlyStats] = useState<IMonthlyStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statisticsAPI.getMonthly(year);
      setMonthlyStats(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch monthly stats');
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchMonthlyStats();
  }, [fetchMonthlyStats]);

  return { monthlyStats, isLoading, error, fetchMonthlyStats };
};

export const useProductStats = () => {
  const [productStats, setProductStats] = useState<IProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statisticsAPI.getProducts();
      setProductStats(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductStats();
  }, [fetchProductStats]);

  return { productStats, isLoading, error, fetchProductStats };
};
