export type Language = 'en' | 'bn';

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'other';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  price: number;
  salePrice?: number;
  cost: number;
  inventory: number;
  sku: string;
  images: string[];
  videoUrl?: string; // Uploaded manual product video URL (MP4 / WebM / storage)
  youtubeUrl?: string; // YouTube video link (watch, share, shorts)
  facebookVideoUrl?: string; // Facebook video or public reel link
  features: string[];
  specifications: Record<string, string>;
  colors?: string[];
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isDeal?: boolean;
  isNewArrival?: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  image: string;
  displayOrder: number;
  isFeatured?: boolean;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  district: string;
  deliveryZone: DeliveryZone;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  freeDeliveryThreshold: number; // default 1000 BDT
  insideDhakaDeliveryFee: number; // default 60 BDT
  outsideDhakaDeliveryFee: number; // default 120 BDT
  metaPixelId: string;
  metaPixelEnabled: boolean;
  metaCapiToken?: string;
  metaTestCode?: string;
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  bkashNumber?: string;
  nagadNumber?: string;
  contactPhone: string;
  contactEmail: string;
  storeNotice: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  isActive: boolean;
}

export interface ProfitCalcInputs {
  sellingPrice: number;
  productCost: number;
  adSpend: number;
  packagingCost: number;
  actualDeliveryExpense: number;
  deliveryFeeCollected: number;
  paymentGatewayFeeRate: number; // e.g. 0.015 for 1.5%
  quantitySold: number;
  returnRatePercent: number;
}
