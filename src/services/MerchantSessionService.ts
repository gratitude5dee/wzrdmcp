import { randomUUID } from 'crypto';
import { Cart, CartItem, MerchantSession, PaymentMethod, BuyerInfo } from '../types/domain.js';
import { ProductFeedService } from './ProductFeedService.js';
import { buildTotals } from '../utils/totals.js';

interface CartMutation {
  productId: string;
  quantity: number;
}

interface MerchantSessionServiceOptions {
  merchantBaseUrl: string;
  merchantApiKey: string;
  sessionTtlMs?: number;
}

interface MerchantCartResponse {
  cart: Cart;
  session: MerchantSession;
}

export class MerchantSessionService {
  private readonly sessions = new Map<string, MerchantSession>();
  private readonly sessionTtlMs: number;
  private cleanupTimer?: NodeJS.Timeout;
  private readonly merchantBaseUrl: string;
  private readonly merchantApiKey: string;

  constructor(
    private readonly feedService: ProductFeedService,
    options: MerchantSessionServiceOptions
  ) {
    this.merchantBaseUrl = options.merchantBaseUrl.replace(/\/$/, '');
    this.merchantApiKey = options.merchantApiKey;
    this.sessionTtlMs = options.sessionTtlMs ?? 30 * 60 * 1000;
  }

  startCleanup(intervalMs = 15 * 60 * 1000): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => this.cleanupExpired(), intervalMs).unref();
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.expires_at).getTime() <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private createSession(sessionId = randomUUID()): MerchantSession {
    const now = new Date();
    const expires = new Date(now.getTime() + this.sessionTtlMs);
    const session: MerchantSession = {
      session_id: sessionId,
      line_items: [],
      status: 'active',
      created_at: now.toISOString(),
      expires_at: expires.toISOString(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  private getOrCreate(sessionId?: string): MerchantSession {
    if (!sessionId) {
      return this.createSession();
    }

    const existing = this.sessions.get(sessionId);
    if (existing) {
      return existing;
    }

    return this.createSession(sessionId);
  }

  async getSession(sessionId: string): Promise<MerchantSession> {
    return this.getOrCreate(sessionId);
  }

  async getCart(sessionId: string): Promise<Cart> {
    const session = this.getOrCreate(sessionId);
    return this.buildCart(session.line_items);
  }

  private async resolveProduct(productId: string) {
    const product = await this.feedService.getProductById(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return product;
  }

  private buildCart(items: CartItem[]): Cart {
    const totals = buildTotals(items);
    return {
      items,
      ...totals,
    };
  }

  private extendSession(session: MerchantSession): void {
    const expires = new Date(Date.now() + this.sessionTtlMs);
    session.expires_at = expires.toISOString();
  }

  private async mutateCart(
    sessionId: string | undefined,
    mutation: CartMutation,
    action: 'add' | 'update' | 'remove'
  ): Promise<MerchantCartResponse> {
    const session = this.getOrCreate(sessionId);
    const { productId, quantity } = mutation;
    const existingIndex = session.line_items.findIndex((item) => item.product_id === productId);

    if (action === 'remove') {
      if (existingIndex !== -1) {
        session.line_items.splice(existingIndex, 1);
      }
    } else {
      const product = await this.resolveProduct(productId);
      const subtotal = { value: product.price.value * quantity, currency: product.price.currency };
      const cartItem: CartItem = {
        id: `${sessionId}-${productId}`,
        product_id: productId,
        product,
        quantity,
        unit_price: product.price,
        subtotal,
      };

      if (existingIndex === -1) {
        session.line_items.push(cartItem);
      } else {
        session.line_items[existingIndex] = cartItem;
      }
    }

    this.extendSession(session);
    const cart = this.buildCart(session.line_items);
    return { cart, session };
  }

  async addItem(sessionId: string | undefined, productId: string, quantity: number): Promise<MerchantCartResponse> {
    return this.mutateCart(sessionId, { productId, quantity }, 'add');
  }

  async updateItem(sessionId: string | undefined, productId: string, quantity: number): Promise<MerchantCartResponse> {
    return this.mutateCart(sessionId, { productId, quantity }, 'update');
  }

  async removeItem(sessionId: string | undefined, productId: string): Promise<MerchantCartResponse> {
    return this.mutateCart(sessionId, { productId, quantity: 0 }, 'remove');
  }

  async setBuyerInfo(sessionId: string | undefined, buyerInfo: BuyerInfo): Promise<MerchantSession> {
    const session = this.getOrCreate(sessionId);
    session.buyer_info = buyerInfo;
    if (session.status === 'active') {
      session.status = 'buyer_info_collected';
    }
    this.extendSession(session);
    return session;
  }

  async setPaymentMethod(sessionId: string | undefined, paymentMethod: PaymentMethod): Promise<MerchantSession> {
    const session = this.getOrCreate(sessionId);
    session.payment_method = paymentMethod;
    if (session.status === 'buyer_info_collected') {
      session.status = 'payment_collected';
    }
    this.extendSession(session);
    return session;
  }

  async markCompleted(sessionId: string | undefined): Promise<MerchantSession> {
    const session = this.getOrCreate(sessionId);
    session.status = 'completed';
    return session;
  }

  async fetchCatalogHtml(): Promise<string> {
    const url = `${this.merchantBaseUrl}/api/catalog.html`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.merchantApiKey}`,
      },
    });

    if (!response.ok) {
      return '<p>Catalog unavailable</p>';
    }

    return response.text();
  }
}
