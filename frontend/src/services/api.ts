import axios from 'axios';
import type {
  Product, ProductCreate, ProductUpdate, ProductListResponse,
  Movement, MovementCreate, MovementListResponse,
  DashboardStats,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// ====== PRODUCTS ======

export const getProducts = async (params?: {
  search?: string;
  category?: string;
  low_stock?: boolean;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> => {
  const { data } = await api.get<ProductListResponse>('/api/products', { params });
  return data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const { data } = await api.get<Product>(`/api/products/${id}`);
  return data;
};

export const createProduct = async (product: ProductCreate): Promise<Product> => {
  const { data } = await api.post<Product>('/api/products', product);
  return data;
};

export const updateProduct = async (id: number, product: ProductUpdate): Promise<Product> => {
  const { data } = await api.put<Product>(`/api/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

export const getCategories = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>('/api/products/categories');
  return data;
};

// ====== MOVEMENTS ======

export const getMovements = async (params?: {
  product_id?: number;
  type?: string;
  limit?: number;
}): Promise<MovementListResponse> => {
  const { data } = await api.get<MovementListResponse>('/api/movements', { params });
  return data;
};

export const createMovement = async (movement: MovementCreate): Promise<Movement> => {
  const { data } = await api.post<Movement>('/api/movements', movement);
  return data;
};

// ====== DASHBOARD ======

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>('/api/dashboard/stats');
  return data;
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/api/dashboard/low-stock');
  return data;
};

export const getRecentMovements = async (): Promise<Movement[]> => {
  const { data } = await api.get<Movement[]>('/api/dashboard/recent');
  return data;
};

export default api;
