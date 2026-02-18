import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  IApiResponse,
  ILoginInput,
  IRegisterInput,
  IAuthResponse,
  IProduct,
  IProductInput,
  ICustomer,
  ICustomerInput,
  IPayment,
  IPaymentInput,
  IPaymentUpdateInput,
  IDashboardStats,
  IMonthlyStats,
  IProductStats,
  IPaginationParams,
  IPaymentFilters,
  ICustomerFilters,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5008/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IApiResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: ILoginInput): Promise<IAuthResponse> => {
    const response = await apiClient.post<IApiResponse<IAuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  register: async (data: IRegisterInput): Promise<IAuthResponse> => {
    const response = await apiClient.post<IApiResponse<IAuthResponse>>('/auth/register', data);
    return response.data.data!;
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: { search?: string; category?: string; isActive?: boolean }) => {
    const response = await apiClient.get<IApiResponse<IProduct[]>>('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<IApiResponse<IProduct>>(`/products/${id}`);
    return response.data.data!;
  },

  create: async (data: IProductInput) => {
    const response = await apiClient.post<IApiResponse<IProduct>>('/products', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<IProductInput>) => {
    const response = await apiClient.put<IApiResponse<IProduct>>(`/products/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params?: IPaginationParams & ICustomerFilters) => {
    const response = await apiClient.get<IApiResponse<ICustomer[]>>('/customers', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<IApiResponse<ICustomer>>(`/customers/${id}`);
    return response.data.data!;
  },

  create: async (data: ICustomerInput) => {
    const response = await apiClient.post<IApiResponse<ICustomer>>('/customers', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<ICustomerInput>) => {
    const response = await apiClient.put<IApiResponse<ICustomer>>(`/customers/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/customers/${id}`);
  },

  addProduct: async (customerId: string, productId: string) => {
    const response = await apiClient.post<IApiResponse<ICustomer>>(
      `/customers/${customerId}/products`,
      { productId }
    );
    return response.data.data!;
  },

  removeProduct: async (customerId: string, productId: string) => {
    const response = await apiClient.delete<IApiResponse<ICustomer>>(
      `/customers/${customerId}/products/${productId}`
    );
    return response.data.data!;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (params?: IPaymentFilters) => {
    const response = await apiClient.get<IApiResponse<IPayment[]>>('/payments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<IApiResponse<IPayment>>(`/payments/${id}`);
    return response.data.data!;
  },

  create: async (data: IPaymentInput) => {
    const response = await apiClient.post<IApiResponse<IPayment>>('/payments', data);
    return response.data.data!;
  },

  update: async (id: string, data: IPaymentUpdateInput) => {
    const response = await apiClient.put<IApiResponse<IPayment>>(`/payments/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/payments/${id}`);
  },

  markAsPaid: async (id: string, amount?: number) => {
    const body: IPaymentUpdateInput = {
      status: 'paid',
      paidDate: new Date().toISOString(),
    };
    if (amount !== undefined) body.amount = amount;
    const response = await apiClient.put<IApiResponse<IPayment>>(`/payments/${id}`, body);
    return response.data.data!;
  },

  getOverdue: async () => {
    const response = await apiClient.get<IApiResponse<IPayment[]>>('/payments/overdue/list');
    return response.data.data || [];
  },

  generateMonthly: async (month: number, year: number) => {
    const response = await apiClient.post<IApiResponse<{ generated: number; skipped: number }>>(
      '/payments/generate/monthly',
      { month, year }
    );
    return response.data.data!;
  },
};

// Statistics API
export const statisticsAPI = {
  getDashboard: async () => {
    const response = await apiClient.get<IApiResponse<IDashboardStats>>('/statistics/dashboard');
    return response.data.data!;
  },

  getMonthly: async (year?: number) => {
    const response = await apiClient.get<IApiResponse<IMonthlyStats[]>>('/statistics/monthly', {
      params: year ? { year } : undefined,
    });
    return response.data.data!;
  },

  getProducts: async () => {
    const response = await apiClient.get<IApiResponse<IProductStats[]>>('/statistics/products');
    return response.data.data!;
  },

  getRevenue: async (months?: number) => {
    const response = await apiClient.get<IApiResponse>('/statistics/revenue', {
      params: months ? { months } : undefined,
    });
    return response.data.data!;
  },
};

export default apiClient;
