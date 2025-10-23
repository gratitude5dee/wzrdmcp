# Troubleshooting

## 401 Unauthorized Responses

- Confirm the `Authorization` header uses a valid API key listed in `ALLOWED_API_KEYS`.
- Ensure the `API-Version` header is exactly `2025-09-29`.

## Signature Verification Failures

- Verify the `Signature` header format is `sha256=<hex digest>`.
- Ensure the request body matches the payload used to generate the HMAC.
- Check that the `Timestamp` header is within five minutes of the server time.

## Idempotency Conflicts

- Reuse idempotency keys only when replaying the same request body.
- Clear stale keys by restarting the service or adjusting TTL if necessary.

## SSE Connection Drops

- Confirm clients reconnect using the provided `sessionId` query parameter on `/messages`.
- Verify load balancers use sticky sessions or bypass them for SSE connections.

## Rate Limiting

- Monitor `X-RateLimit-*` headers for quota information.
- Increase `RATE_LIMIT_MAX_REQUESTS` or decrease `RATE_LIMIT_WINDOW_MS` as appropriate.
