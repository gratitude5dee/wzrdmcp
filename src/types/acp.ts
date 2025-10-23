import { z } from 'zod';

export const ACP_API_VERSION = '2025-09-29' as const;

export interface ACPHeaders {
  Authorization: string;
  'Content-Type': 'application/json';
  'API-Version': typeof ACP_API_VERSION;
  'Accept-Language'?: string;
  'User-Agent'?: string;
  'Idempotency-Key'?: string;
  'Request-Id'?: string;
  Signature?: string;
  Timestamp?: string;
}

export type ACPErrorType =
  | 'invalid_request'
  | 'request_not_idempotent'
  | 'processing_error'
  | 'service_unavailable'
  | 'rate_limit_exceeded';

export interface ACPError {
  type: ACPErrorType;
  code: string;
  message: string;
  param?: string;
  request_id?: string;
}

export interface ACPResponse<T = unknown> {
  data?: T;
  metadata?: {
    request_id?: string;
    idempotency_key?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export const ACP_ERROR_STATUS_CODES: Record<ACPErrorType, number> = {
  invalid_request: 400,
  request_not_idempotent: 409,
  processing_error: 500,
  service_unavailable: 503,
  rate_limit_exceeded: 429,
};

export function createACPHeaders(
  apiKey: string,
  options: Partial<Omit<ACPHeaders, 'Authorization' | 'Content-Type' | 'API-Version'>> = {}
): ACPHeaders {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'API-Version': ACP_API_VERSION,
    'User-Agent': options['User-Agent'] ?? 'ACP-MCP-Server/1.0',
    ...options,
  } as ACPHeaders;
}

export function createACPError(
  type: ACPErrorType,
  code: string,
  message: string,
  param?: string,
  requestId?: string
): ACPError {
  const base: ACPError = {
    type,
    code,
    message,
  };

  if (param) base.param = param;
  if (requestId) base.request_id = requestId;

  return base;
}

export const AcpResponseSchema = z.object({
  data: z.unknown().optional(),
  metadata: z
    .object({
      request_id: z.string().optional(),
      idempotency_key: z.string().optional(),
      timestamp: z.string().optional(),
    })
    .catchall(z.unknown())
    .optional(),
});

export type ValidatedACPResponse<T = unknown> = z.infer<typeof AcpResponseSchema> & {
  data?: T;
};
