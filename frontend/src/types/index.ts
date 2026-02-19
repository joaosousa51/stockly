// ====== PRODUCT ======

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  price: number;
  quantity: number;
  min_stock: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  quantity: number;
  min_stock: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  min_stock?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pages: number;
}

// ====== MOVEMENT ======

export type MovementType = 'entrada' | 'saida';

export interface Movement {
  id: number;
  product_id: number;
  product_name: string | null;
  type: MovementType;
  quantity: number;
  notes: string | null;
  created_at: string;
}

export interface MovementCreate {
  product_id: number;
  type: MovementType;
  quantity: number;
  notes?: string;
}

export interface MovementListResponse {
  data: Movement[];
  total: number;
}

// ====== DASHBOARD ======

export interface DashboardStats {
  total_products: number;
  total_quantity: number;
  low_stock_count: number;
  total_value: number;
  entries_today: number;
  exits_today: number;
}
