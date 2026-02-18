// User Types
export interface IUser {
  id: string;
  username: string;
  role: string;
}

export interface ILoginInput {
  username: string;
  password: string;
}

export interface IRegisterInput {
  username: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

// Product Types
export interface IProduct {
  _id: string;
  name: string;
  price: number;
  description?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  category?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductInput {
  name: string;
  price: number;
  description?: string;
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  category?: string;
}

// Customer Types
export interface ICustomer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  products: (string | IProduct)[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustomerInput {
  name: string;
  phone?: string;
  address?: string;
  products?: string[];
}

// Payment Types
export type PaymentStatus = 'paid' | 'unpaid' | 'pending';

export interface IPayment {
  _id: string;
  customer: string | { _id: string; name: string; email?: string };
  product: string | { _id: string; name: string; price: number };
  month: number;
  year: number;
  amount: number;
  paidDate?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentInput {
  customer: string;
  product: string;
  month: number;
  year: number;
  amount?: number;
  status?: PaymentStatus;
  notes?: string;
}

export interface IPaymentUpdateInput {
  amount?: number;
  status?: PaymentStatus;
  paidDate?: string;
  notes?: string;
}

// Statistics Types
export interface IMonthlyStats {
  month: number;
  year: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  pendingAmount: number;
  totalPayments: number;
  paidCount: number;
  unpaidCount: number;
}

export interface IProductStats {
  productId: string;
  productName: string;
  totalRevenue: number;
  customerCount: number;
}

export interface IDashboardStats {
  counts: {
    customers: number;
    products: number;
    payments: number;
  };
  currentMonth: {
    totalRevenue: number;
    paidAmount: number;
    unpaidAmount: number;
    totalCount: number;
    paidCount: number;
  };
  overdueCount: number;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination
export interface IPaginationParams {
  page?: number;
  limit?: number;
}

// Filter Types
export interface IPaymentFilters {
  customer?: string;
  product?: string;
  month?: number;
  year?: number;
  status?: PaymentStatus;
}

export interface ICustomerFilters {
  search?: string;
  isActive?: boolean;
}
