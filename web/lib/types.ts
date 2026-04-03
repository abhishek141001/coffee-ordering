export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  basePrice: number;
  sizes: {
    small: { price: number };
    medium: { price: number };
    large: { price: number };
  };
  available?: boolean;
}

export interface OrderItem {
  item: string;
  size: string;
  price: number;
}

export interface Order {
  _id: string;
  item?: string;
  size?: string;
  price?: number;
  items?: OrderItem[];
  totalPrice: number;
  userId: { _id: string; username: string; phone?: string } | string;
  shopId: string;
  status: "pending_payment" | "paid" | "accepted" | "rejected";
  eta?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  refund_status?: "none" | "processed" | "failed";
  userLocation?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  acceptanceRate: number;
}

export interface Shop {
  _id: string;
  name: string;
  slug: string;
  owner: { name: string; email: string; phone: string };
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  menu: MenuItem[];
  telegramChatId: string;
  operatingHours: { open: string; close: string };
  status: string;
}

export interface PlatformStats {
  totalShops: number;
  activeShops: number;
  inactiveShops: number;
  pendingShops: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  phone: string;
  createdAt: string;
}

export interface AdminOrder extends Omit<Order, "shopId"> {
  shopId: { _id: string; name: string; slug: string } | string;
}

export interface OnboardFormData {
  name: string;
  owner: { name: string; email: string; phone: string };
  location: {
    coordinates: [number, number];
    address: string;
  };
  menu: MenuItem[];
  telegramChatId: string;
  operatingHours: { open: string; close: string };
}
