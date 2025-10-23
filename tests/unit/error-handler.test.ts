import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formatACPError } from '../../src/utils/error-handler.js';

describe('formatACPError', () => {
  it('wraps zod errors as invalid_request', () => {
    const schema = z.object({ name: z.string() });
    try {
      schema.parse({});
    } catch (error) {
      const acpError = formatACPError(error, 'test');
      expect(acpError.type).toBe('invalid_request');
      expect(acpError.code).toBe('validation_error');
      expect(acpError.request_id).toBe('test');
    }
  });

  it('returns processing_error for unknown errors', () => {
    const acpError = formatACPError(new Error('boom'), 'req-123');
    expect(acpError.type).toBe('processing_error');
    expect(acpError.code).toBe('internal_error');
    expect(acpError.request_id).toBe('req-123');
  });
});
