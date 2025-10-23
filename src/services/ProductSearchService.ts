import { Product } from '../types/domain.js';
import { LookupItemsSchema } from '../utils/validation.js';
import { ProductFeedService } from './ProductFeedService.js';

interface SearchParams {
  query: string;
  limit?: number;
  category?: string;
}

export class ProductSearchService {
  constructor(private readonly feedService: ProductFeedService) {}

  async search(params: SearchParams): Promise<Product[]> {
    const validated = LookupItemsSchema.parse(params);
    const products = await this.feedService.getProducts();
    const normalizedQuery = validated.query.toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = validated.category
        ? product.category.toLowerCase() === validated.category.toLowerCase()
        : true;
      return matchesQuery && matchesCategory;
    });

    return filtered.slice(0, validated.limit ?? 10);
  }
}
