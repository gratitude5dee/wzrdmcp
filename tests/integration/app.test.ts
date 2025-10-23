import { afterAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

process.env.ALLOWED_API_KEYS = 'test_key';
process.env.MERCHANT_BASE_URL = 'http://merchant.test';
process.env.MERCHANT_API_KEY = 'merchant_key';
process.env.PSP_BASE_URL = 'http://psp.test';
process.env.PSP_API_KEY = 'psp_key';

const mockFetch = vi.fn(async (input: RequestInfo) => {
  const url = typeof input === 'string' ? input : input.toString();

  if (url.endsWith('/api/feed')) {
    return {
      ok: true,
      json: async () => ({
        products: [
          {
            id: 'prod_1',
            name: 'Test Product',
            description: 'A product used for testing',
            price: { value: 1000, currency: 'USD' },
            image_url: 'http://example.com/image.png',
            category: 'testing',
            availability: 'in_stock',
          },
        ],
        categories: ['testing'],
      }),
      text: async () => '<p>Catalog</p>',
    } as unknown as Response;
  }

  if (url.endsWith('/api/catalog.html')) {
    return {
      ok: true,
      text: async () => '<p>Catalog</p>',
    } as unknown as Response;
  }

  if (url.includes('/payment_intents')) {
    return {
      ok: true,
      json: async () => ({
        id: 'pi_123',
        status: 'requires_confirmation',
        client_secret: 'secret',
        amount: 1000,
        currency: 'USD',
      }),
    } as unknown as Response;
  }

  return {
    ok: true,
    json: async () => ({}),
    text: async () => '',
  } as unknown as Response;
});

vi.stubGlobal('fetch', mockFetch);

const { app, serverInstance } = await import('../../src/index.js');

const authHeaders = {
  Authorization: 'Bearer test_key',
  'API-Version': '2025-09-29',
  'Content-Type': 'application/json',
};

describe('App integration', () => {
  afterAll(async () => {
    await serverInstance.close();
  });

  it('returns API-Version header on health check', async () => {
    const response = await request(app).get('/health').set(authHeaders);
    expect(response.status).toBe(200);
    expect(response.headers['api-version']).toBe('2025-09-29');
  });

  it('rejects unauthorized requests', async () => {
    const response = await request(app).get('/health').set({ 'API-Version': '2025-09-29' });
    expect(response.status).toBe(401);
    expect(response.body.type).toBe('invalid_request');
    expect(response.body.code).toBe('unauthorized');
  });

  it('enforces idempotency keys for cart operations', async () => {
    const body = { productId: 'prod_1', quantity: 1 };
    const headers = {
      ...authHeaders,
      'Idempotency-Key': '123e4567-e89b-12d3-a456-426614174000',
    };

    const first = await request(app).post('/cart/add').set(headers).send(body);
    expect(first.status).toBe(200);

    const second = await request(app).post('/cart/add').set(headers).send(body);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });
});
