import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { ProductFeedService } from '../services/ProductFeedService.js';
import { BrowseCatalogInputSchema } from '../utils/validation.js';
import { formatACPError } from '../utils/error-handler.js';

export function registerBrowseCatalogTool(
  server: McpServer,
  merchantService: MerchantSessionService,
  feedService: ProductFeedService,
  sessionId: string
) {
  server.tool(
    'browse_catalog',
    'Retrieve merchant catalog for browsing',
    {},
    async (args) => {
      try {
        BrowseCatalogInputSchema.parse(args);
        const [catalogHtml, categories, products] = await Promise.all([
          merchantService.fetchCatalogHtml(),
          feedService.getCategories(),
          feedService.getProducts(),
        ]);

        const payload = {
          data: {
            catalog_html: catalogHtml,
            categories,
            total_products: products.length,
          },
          metadata: {
            request_id: sessionId,
            cached: true,
            timestamp: new Date().toISOString(),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      } catch (error) {
        const acpError = formatACPError(error, sessionId, 'browse_catalog');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(acpError, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
