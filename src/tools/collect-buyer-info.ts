import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { CollectBuyerInfoInputSchema } from '../utils/validation.js';
import { formatACPError } from '../utils/error-handler.js';

export function registerCollectBuyerInfoTool(server: McpServer, merchantService: MerchantSessionService, sessionId: string) {
  server.tool(
    'collect_buyer_info',
    'Collect buyer contact and shipping details',
    {
      session_id: {
        type: 'string',
        description: 'Existing merchant session identifier',
        optional: true,
      },
      email: {
        type: 'string',
        description: 'Buyer email address',
      },
      phone: {
        type: 'string',
        description: 'Optional buyer phone number',
        optional: true,
      },
      shipping_address: {
        type: 'object',
        description: 'Shipping address object',
      },
      billing_address: {
        type: 'object',
        description: 'Optional billing address object',
        optional: true,
      },
    },
    async (args) => {
      try {
        const { session_id, ...buyerInfo } = CollectBuyerInfoInputSchema.parse(args);
        const session = await merchantService.setBuyerInfo(session_id, buyerInfo);
        const payload = {
          data: {
            session_id: session.session_id,
            buyer_info_collected: true,
          },
          metadata: {
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
        const acpError = formatACPError(error, sessionId, 'collect_buyer_info');
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
