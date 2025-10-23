# Deployment Guide

## Environment Variables

Set the following variables in your production environment:

- `PORT`
- `NODE_ENV`
- `MERCHANT_BASE_URL`
- `MERCHANT_API_KEY`
- `PSP_BASE_URL`
- `PSP_API_KEY`
- `ALLOWED_API_KEYS`
- `SIGNATURE_SECRET`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `LOG_LEVEL`

## Build and Release

```bash
npm ci
npm run build
npm run test:coverage
```

Package the Docker image:

```bash
docker build -t acp-commerce-mcp-server:latest .
```

Push to your registry and deploy behind a TLS-terminating reverse proxy. Ensure the proxy preserves:

- `Authorization`
- `API-Version`
- `Request-Id`
- `Idempotency-Key`
- `Signature`
- `Timestamp`

## Observability

Structured logs emit JSON suitable for aggregation systems such as Datadog or ELK. Include request ID and session ID in log queries for tracing.

## Scaling

- Enable database-backed stores for sessions/idempotency when horizontal scaling is required.
- Front the service with a load balancer that supports sticky sessions for SSE streams.
