import { Request } from 'express';
import { ACPResponse } from '../types/acp.js';

interface BuildResponseOptions {
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export function buildACPResponse<T>(
  req: Request,
  data: T,
  options: BuildResponseOptions = {}
): ACPResponse<T> {
  const requestId = (req.headers['request-id'] as string) ?? '';
  const idempotencyKey = options.idempotencyKey ?? (req.headers['idempotency-key'] as string | undefined);

  return {
    data,
    metadata: {
      request_id: requestId || undefined,
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      ...options.metadata,
    },
  };
}
