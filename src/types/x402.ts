import { z } from 'zod';

export const X402_VERSION = '2025-09-29' as const;

export interface X402Headers {
  Authorization: string;
  'Content-Type': 'application/json';
  'API-Version': typeof X402_VERSION;
  'Accept-Language'?: string;
  'User-Agent'?: string;
  'Idempotency-Key'?: string;
  'Request-Id'?: string;
  Signature?: string;
  Timestamp?: string;
}

export const X402HeaderSchema = z.object({
  Authorization: z.string().regex(/^Bearer\s+.+$/, {
    message: 'Authorization header must be a Bearer token',
  }),
  'Content-Type': z.literal('application/json'),
  'API-Version': z.literal(X402_VERSION),
  'Accept-Language': z
    .string()
    .regex(/^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$/)
    .optional(),
  'User-Agent': z.string().max(256).optional(),
  'Idempotency-Key': z
    .string()
    .uuid({ message: 'Idempotency-Key must be a UUID v4' })
    .optional(),
  'Request-Id': z
    .string()
    .uuid({ message: 'Request-Id must be a UUID v4' })
    .optional(),
  Signature: z.string().regex(/^sha256=[A-Fa-f0-9]{64}$/).optional(),
  Timestamp: z
    .string()
    .datetime({ offset: true, message: 'Timestamp must be RFC3339 format' })
    .optional(),
});

export type ValidatedX402Headers = z.infer<typeof X402HeaderSchema>;
