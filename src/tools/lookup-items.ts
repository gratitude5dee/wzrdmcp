import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProductSearchService } from '../services/ProductSearchService.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { LookupItemsSchema } from '../utils/validation.js';
import { formatACPError } from '../utils/error-handler.js';

export function registerLookupItemsTool(
  server: McpServer,
  merchantService: MerchantSessionService,
  searchService: ProductSearchService,
  sessionId: string
) {
  server.tool(
    'lookup_items',
    'Search for products in the merchant catalog',
    {
      query: {
        type: 'string',
        description: 'Search query for products',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (1-50)',
        default: 10,
      },
      category: {
        type: 'string',
        description: 'Optional category filter',
      },
    },
    async (args) => {
      try {
        const validated = LookupItemsSchema.parse(args);
        const results = await searchService.search(validated);
        const payload = {
          data: {
            products: results,
          },
          metadata: {
            count: results.length,
            query: validated.query,
            request_id: sessionId,
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
        const acpError = formatACPError(error, sessionId, 'lookup_items');
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
