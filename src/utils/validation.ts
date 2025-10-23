import { z } from 'zod';
import { X402HeaderSchema } from '../types/x402.js';

const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(3),
  country: z.string().length(2),
});

export const BuyerInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(32).optional(),
  shipping_address: AddressSchema,
  billing_address: AddressSchema.optional(),
});

export const PaymentDetailsSchema = z.object({
  payment_method: z.enum(['card', 'bank_account', 'digital_wallet']),
  payment_token: z.string().min(8),
  save_for_future: z.boolean().optional(),
});

export const LookupItemsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(10),
  category: z.string().min(1).optional(),
});

export const CollectBuyerInfoInputSchema = BuyerInfoSchema.extend({
  session_id: z.string().uuid().optional(),
});

export const CollectPaymentDetailsInputSchema = PaymentDetailsSchema.extend({
  session_id: z.string().uuid().optional(),
});

export const BrowseCatalogInputSchema = z.object({});

export const CartMutationSchema = z.object({
  session_id: z.string().uuid().optional(),
  productId: z.string().min(1),
  quantity: z.number().int().min(0).max(99).default(1),
});

export const PaymentInitiateSchema = z.object({
  session_id: z.string().uuid(),
  amount: z.number().int().min(1),
});

export const PaymentConfirmSchema = z.object({
  payment_intent_id: z.string().min(1),
  session_id: z.string().uuid().optional(),
});

export function validateHeaders(headers: Record<string, unknown>) {
  return X402HeaderSchema.parse(headers);
}

export { AddressSchema };
