export interface AdminProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price?: number;
  cover_image: string;
  images: string[];
  category_id: number;
  category?: AdminCategory;
  tags: string[];
  in_stock: boolean;
  stock_quantity: number;
  rating: number;
  review_count: number;
  features: string[];
  dimensions?: string;
  weight?: string;
  care_instructions?: string;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive" | "draft";
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: "cash" | "card" | "online" | "bank_transfer";
  delivery_address: string;
  delivery_date?: string;
  notes?: string;
  items: AdminOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: AdminOrder[];
  topProducts: AdminProduct[];
  monthlyRevenue: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}
