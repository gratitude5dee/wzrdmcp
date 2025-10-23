import { CartItem, CartTotals, Money } from '../types/domain.js';

const TAX_RATE = 0.07;
const SHIPPING_FLAT = 500; // cents

function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error('Currency mismatch');
  }
  return { value: a.value + b.value, currency: a.currency };
}

export function buildTotals(items: CartItem[]): CartTotals {
  const currency = items[0]?.subtotal.currency ?? 'USD';
  const zero: Money = { value: 0, currency };

  const subtotal = items.reduce<Money>((acc, item) => {
    if (acc.currency !== item.subtotal.currency) {
      throw new Error('Cart contains multiple currencies');
    }
    return { currency: acc.currency, value: acc.value + item.subtotal.value };
  }, zero);

  const tax: Money = { value: Math.round(subtotal.value * TAX_RATE), currency };
  const shipping: Money = items.length > 0 ? { value: SHIPPING_FLAT, currency } : { value: 0, currency };
  const total = addMoney(addMoney(subtotal, tax), shipping);

  return {
    subtotal,
    tax,
    shipping,
    total,
  };
}
