import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { PaymentService } from '../services/PaymentService.js';
import { CollectPaymentDetailsInputSchema } from '../utils/validation.js';
import { formatACPError } from '../utils/error-handler.js';

export function registerCollectPaymentDetailsTool(
  server: McpServer,
  merchantService: MerchantSessionService,
  paymentService: PaymentService,
  sessionId: string
) {
  server.tool(
    'collect_payment_details',
    'Collect payment method information and create payment intent',
    {
      session_id: {
        type: 'string',
        description: 'Merchant session identifier',
        optional: true,
      },
      payment_method: {
        type: 'string',
        description: 'Payment method type (card, bank_account, digital_wallet)',
      },
      payment_token: {
        type: 'string',
        description: 'Tokenized payment instrument reference',
      },
      save_for_future: {
        type: 'boolean',
        description: 'Persist payment method for future use',
        optional: true,
      },
    },
    async (args) => {
      try {
        const { session_id, ...paymentDetails } = CollectPaymentDetailsInputSchema.parse(args);
        const session = await merchantService.setPaymentMethod(session_id, {
          type: paymentDetails.payment_method,
          token: paymentDetails.payment_token,
        });
        const cart = await merchantService.getCart(session.session_id);
        const intent = await paymentService.createIntent(session.session_id, cart.total.value);

        const payload = {
          data: {
            payment_intent_id: intent.id,
            status: intent.status,
            client_secret: intent.client_secret,
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
        const acpError = formatACPError(error, sessionId, 'collect_payment_details');
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
