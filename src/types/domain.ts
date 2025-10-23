export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'backorder';

export interface Money {
  value: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: Money;
  image_url: string;
  category: string;
  availability: ProductAvailability;
  metadata?: Record<string, unknown>;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: Money;
  subtotal: Money;
}

export interface CartTotals {
  subtotal: Money;
  tax: Money;
  shipping: Money;
  total: Money;
}

export interface Cart extends CartTotals {
  items: CartItem[];
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BuyerInfo {
  email: string;
  phone?: string;
  shipping_address: Address;
  billing_address?: Address;
}

export type PaymentMethodType = 'card' | 'bank_account' | 'digital_wallet';

export interface PaymentMethod {
  type: PaymentMethodType;
  token: string;
  last4?: string;
  brand?: string;
}

export type SessionStatus =
  | 'active'
  | 'buyer_info_collected'
  | 'payment_collected'
  | 'completed'
  | 'expired';

export interface MerchantSession {
  session_id: string;
  line_items: CartItem[];
  buyer_info?: BuyerInfo;
  payment_method?: PaymentMethod;
  status: SessionStatus;
  created_at: string;
  expires_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: Money;
  status: 'requires_confirmation' | 'succeeded' | 'failed';
  client_secret?: string;
  metadata?: Record<string, unknown>;
}
