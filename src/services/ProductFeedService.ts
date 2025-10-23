import { logError, logInfo } from '../utils/logger.js';
import { Product } from '../types/domain.js';

interface ProductFeedResponse {
  products: Product[];
  categories?: string[];
  updated_at?: string;
}

export class ProductFeedService {
  private cache: ProductFeedResponse | null = null;
  private readonly ttlMs: number;
  private lastFetchedAt = 0;
  private readonly merchantBaseUrl: string;
  private readonly apiKey: string;

  constructor(options: { merchantBaseUrl: string; apiKey: string; ttlMs?: number }) {
    this.merchantBaseUrl = options.merchantBaseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.ttlMs = options.ttlMs ?? 5 * 60 * 1000;
  }

  private async fetchFeed(): Promise<ProductFeedResponse> {
    const url = `${this.merchantBaseUrl}/api/feed`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product feed: ${response.status}`);
    }

    const payload = (await response.json()) as ProductFeedResponse;
    return payload;
  }

  private async ensureCache(): Promise<void> {
    if (this.cache && Date.now() - this.lastFetchedAt < this.ttlMs) {
      return;
    }

    try {
      const feed = await this.fetchFeed();
      this.cache = feed;
      this.lastFetchedAt = Date.now();
      logInfo('Product feed refreshed', {
        product_count: feed.products?.length ?? 0,
      });
    } catch (error) {
      logError('Failed to refresh product feed', { error });
      if (!this.cache) {
        this.cache = { products: [], categories: [] };
      }
    }
  }

  async getProducts(): Promise<Product[]> {
    await this.ensureCache();
    return this.cache?.products ?? [];
  }

  async getCategories(): Promise<string[]> {
    await this.ensureCache();
    return this.cache?.categories ?? [];
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((product) => product.id === productId);
  }
}
