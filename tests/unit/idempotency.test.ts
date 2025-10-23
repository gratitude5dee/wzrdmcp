import { describe, expect, it } from 'vitest';
import { IdempotencyService } from '../../src/services/IdempotencyService.js';

describe('IdempotencyService', () => {
  it('returns cached response for identical payloads', async () => {
    const service = new IdempotencyService();
    const key = 'test-key';
    const params = { foo: 'bar' };
    const response = { data: 'ok' };

    await service.store(key, params, response);
    const cached = await service.check(key, params);
    expect(cached).toEqual(response);
  });

  it('throws when reusing key with different payload', async () => {
    const service = new IdempotencyService();
    const key = 'test-key-2';

    await service.store(key, { foo: 'bar' }, { data: 'ok' });
    await expect(service.check(key, { foo: 'baz' })).rejects.toMatchObject({
      type: 'request_not_idempotent',
    });
  });
});
