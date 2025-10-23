import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerAllTools } from './tools/register.js';
import { ProductFeedService } from './services/ProductFeedService.js';
import { ProductSearchService } from './services/ProductSearchService.js';
import { MerchantSessionService } from './services/MerchantSessionService.js';
import { PaymentService } from './services/PaymentService.js';
import { IdempotencyService } from './services/IdempotencyService.js';
import { requestContextMiddleware } from './middleware/request-context.js';
import { authenticationMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { createIdempotencyMiddleware } from './middleware/idempotency.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';
import { createHealthRouter } from './routes/health.js';
import { createCartRouter } from './routes/cart.js';
import { createPaymentRouter } from './routes/payment.js';
import { createACPError } from './types/acp.js';
import { logInfo } from './utils/logger.js';

const port = parseInt(process.env.PORT ?? '3112', 10);

const app = express();
app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Type', 'API-Version', 'Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'API-Version',
    'Idempotency-Key',
    'Request-Id',
    'Signature',
    'Timestamp',
  ],
}));
app.use(express.json());
app.use(requestContextMiddleware);
app.use(rateLimitMiddleware);
app.use(authenticationMiddleware);

const idempotencyService = new IdempotencyService();
idempotencyService.startCleanup();

const merchantBaseUrl = process.env.MERCHANT_BASE_URL ?? 'http://localhost:3000';
const merchantApiKey = process.env.MERCHANT_API_KEY ?? 'test_api_key_123';
const pspBaseUrl = process.env.PSP_BASE_URL ?? 'http://localhost:4000';
const pspApiKey = process.env.PSP_API_KEY ?? 'test_psp_key';

const productFeedService = new ProductFeedService({ merchantBaseUrl, apiKey: merchantApiKey });
const productSearchService = new ProductSearchService(productFeedService);
const merchantService = new MerchantSessionService(productFeedService, {
  merchantBaseUrl,
  merchantApiKey,
});
merchantService.startCleanup();
const paymentService = new PaymentService({ pspBaseUrl, pspApiKey });

const cartRouter = createCartRouter(merchantService);
const paymentRouter = createPaymentRouter(paymentService, merchantService);

app.use('/health', createHealthRouter());
app.use('/cart', createIdempotencyMiddleware(idempotencyService), cartRouter);
app.use('/payment', createIdempotencyMiddleware(idempotencyService), paymentRouter);

const transports = new Map<string, SSEServerTransport>();

function createMcpServer(sessionId: string) {
  const server = new McpServer({
    name: 'acp-commerce-mcp',
    version: '1.0.0',
  });

  registerAllTools(
    server,
    {
      merchantService,
      productSearchService,
      productFeedService,
      paymentService,
    },
    sessionId
  );

  return server;
}

app.get('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;

  transports.set(sessionId, transport);
  transport.onclose = () => {
    transports.delete(sessionId);
  };

  const server = createMcpServer(sessionId);
  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = (req.query.sessionId as string) ?? '';
  const transport = transports.get(sessionId);

  if (!transport) {
    return res.status(404).json(
      createACPError('invalid_request', 'session_not_found', 'Session not found', undefined, req.headers['request-id'] as string)
    );
  }

  await transport.handlePostMessage(req, res, req.body);
});

app.use(errorHandlerMiddleware);

const serverInstance = app.listen(port, () => {
  logInfo('MCP server listening', { port });
});

export { app, serverInstance };
