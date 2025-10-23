import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { ProductSearchService } from '../services/ProductSearchService.js';
import { ProductFeedService } from '../services/ProductFeedService.js';
import { PaymentService } from '../services/PaymentService.js';
import { registerLookupItemsTool } from './lookup-items.js';
import { registerCollectBuyerInfoTool } from './collect-buyer-info.js';
import { registerCollectPaymentDetailsTool } from './collect-payment-details.js';
import { registerBrowseCatalogTool } from './browse-catalog.js';

export function registerAllTools(
  server: McpServer,
  services: {
    merchantService: MerchantSessionService;
    productSearchService: ProductSearchService;
    productFeedService: ProductFeedService;
    paymentService: PaymentService;
  },
  sessionId: string
) {
  registerLookupItemsTool(server, services.merchantService, services.productSearchService, sessionId);
  registerCollectBuyerInfoTool(server, services.merchantService, sessionId);
  registerCollectPaymentDetailsTool(server, services.merchantService, services.paymentService, sessionId);
  registerBrowseCatalogTool(server, services.merchantService, services.productFeedService, sessionId);
}
