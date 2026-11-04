export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "pharmacien";
};

export type Medicine = {
  _id: string;
  name: string;
  barcode?: string;
  category?: string;
  stock: number;
  lowStockThreshold: number;
  sellingPriceCents: number;
  expiryDate?: string;
  location?: string;
};

export type DashboardSummary = {
  todayRevenueCents: number;
  todaySalesCount: number;
  monthRevenueCents: number;
  lowStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  topProducts: Array<{ _id: string; name: string; quantity: number }>;
};
