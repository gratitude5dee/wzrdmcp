# MCP Tools Reference

All tool responses are serialized as JSON within the MCP `text` content block following ACP conventions.

## `lookup_items`

Searches the merchant catalog.

**Parameters**

- `query` (string, required): Search query.
- `limit` (number, optional, default 10): Maximum results (1-50).
- `category` (string, optional): Category filter.

**Response**

```json
{
  "data": {
    "products": [ ... ]
  },
  "metadata": {
    "count": 3,
    "query": "shoes",
    "request_id": "<session-id>",
    "timestamp": "..."
  }
}
```

## `collect_buyer_info`

Collects buyer contact and address details.

**Parameters**

- `session_id` (string, optional)
- `email` (string, required)
- `phone` (string, optional)
- `shipping_address` (object, required)
- `billing_address` (object, optional)

**Response**

```json
{
  "data": {
    "session_id": "sess_123",
    "buyer_info_collected": true
  },
  "metadata": {
    "request_id": "<session-id>",
    "timestamp": "..."
  }
}
```

## `collect_payment_details`

Registers a payment method and creates a payment intent for the current cart total.

**Parameters**

- `session_id` (string, optional)
- `payment_method` (string, required; `card`, `bank_account`, or `digital_wallet`)
- `payment_token` (string, required)
- `save_for_future` (boolean, optional)

**Response**

```json
{
  "data": {
    "payment_intent_id": "pi_123",
    "status": "requires_confirmation",
    "client_secret": "secret"
  },
  "metadata": {
    "request_id": "<session-id>",
    "timestamp": "..."
  }
}
```

## `browse_catalog`

Returns a cached HTML catalog view with summary metadata.

**Parameters**: none.

**Response**

```json
{
  "data": {
    "catalog_html": "<p>...</p>",
    "categories": ["testing"],
    "total_products": 10
  },
  "metadata": {
    "request_id": "<session-id>",
    "cached": true,
    "timestamp": "..."
  }
}
```
