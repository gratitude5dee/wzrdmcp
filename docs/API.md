# HTTP API Reference

All responses follow the ACP flat response format:

```json
{
  "data": { ... },
  "metadata": {
    "request_id": "...",
    "timestamp": "...",
    "idempotency_key": "..."
  }
}
```

## Headers

- `Authorization: Bearer <api-key>` (required)
- `API-Version: 2025-09-29` (required)
- `Content-Type: application/json`
- Optional: `Idempotency-Key`, `Request-Id`, `Signature`, `Timestamp`

## `GET /health`

Returns server status.

**Response**

```json
{
  "data": {
    "status": "ok",
    "uptime": 1.23
  },
  "metadata": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

## `POST /cart/add`

Adds an item to the cart.

**Body**

```json
{
  "session_id": "optional-session-id",
  "productId": "prod_123",
  "quantity": 1
}
```

**Response**

```json
{
  "data": {
    "cart": { ... },
    "session": { ... }
  },
  "metadata": {
    "request_id": "...",
    "timestamp": "...",
    "idempotency_key": "..."
  }
}
```

## `POST /cart/remove`

Removes an item from the cart. Same request/response shape as `/cart/add`.

## `POST /cart/update`

Updates quantity for an item. Same request/response shape as `/cart/add`.

## `GET /cart`

Requires `session_id` query parameter.

```http
GET /cart?session_id=abc-123
```

**Response**

```json
{
  "data": {
    "items": [ ... ],
    "subtotal": { "value": 1000, "currency": "USD" },
    "tax": { "value": 70, "currency": "USD" },
    "shipping": { "value": 500, "currency": "USD" },
    "total": { "value": 1570, "currency": "USD" }
  },
  "metadata": {
    "request_id": "...",
    "timestamp": "..."
  }
}
```

## `POST /payment/initiate`

Creates a payment intent.

```json
{
  "session_id": "abc-123",
  "amount": 1570
}
```

## `POST /payment/confirm`

Confirms a payment intent. Optional `session_id` marks the merchant session as completed.

```json
{
  "payment_intent_id": "pi_123",
  "session_id": "abc-123"
}
```

## `GET /payment/status/:intentId`

Retrieves status for a payment intent.
