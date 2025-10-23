import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { createACPError } from '../types/acp.js';
import { validateHeaders } from '../utils/validation.js';
import { formatACPError, acpStatusFromError } from '../utils/error-handler.js';

const ALLOWED_KEYS = (process.env.ALLOWED_API_KEYS ?? process.env.MERCHANT_API_KEY ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET ?? '';
const MAX_TIMESTAMP_SKEW_MS = 5 * 60 * 1000;

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for Authorization header first to return 401 for missing auth
    const authHeader = req.header('authorization');
    if (!authHeader) {
      throw createACPError('invalid_request', 'unauthorized', 'Authorization header is required', undefined, req.header('request-id'));
    }

    const headers = {
      Authorization: authHeader,
      'Content-Type': (req.header('content-type') as 'application/json') ?? 'application/json',
      'API-Version': (req.header('api-version') as '2025-09-29') ?? '2025-09-29',
      'Accept-Language': req.header('accept-language') ?? undefined,
      'User-Agent': req.header('user-agent') ?? undefined,
      'Idempotency-Key': req.header('idempotency-key') ?? undefined,
      'Request-Id': req.header('request-id') ?? undefined,
      Signature: req.header('signature') ?? undefined,
      Timestamp: req.header('timestamp') ?? undefined,
    };

    validateHeaders(headers);

    const token = headers.Authorization.replace(/^Bearer\s+/i, '');
    if (!ALLOWED_KEYS.includes(token)) {
      throw createACPError('invalid_request', 'unauthorized', 'Authorization token is invalid', undefined, headers['Request-Id']);
    }

    if (headers.Signature) {
      if (!SIGNATURE_SECRET) {
        throw createACPError('invalid_request', 'signature_not_configured', 'Signature provided but server is not configured');
      }

      if (!headers.Timestamp) {
        throw createACPError('invalid_request', 'timestamp_missing', 'Timestamp header is required when using Signature');
      }

      const timestampMs = Date.parse(headers.Timestamp);
      if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_TIMESTAMP_SKEW_MS) {
        throw createACPError('invalid_request', 'timestamp_expired', 'Timestamp is outside the acceptable window');
      }

      const payload = JSON.stringify({
        method: req.method,
        path: req.originalUrl.split('?')[0],
        timestamp: headers.Timestamp,
        body: req.body ?? null,
      });

      const digest = crypto.createHmac('sha256', SIGNATURE_SECRET).update(payload).digest('hex');
      const expected = `sha256=${digest}`;
      if (expected !== headers.Signature) {
        throw createACPError('invalid_request', 'signature_mismatch', 'Signature verification failed');
      }
    }

    next();
  } catch (error) {
    const acpError = formatACPError(error, req.headers['request-id'] as string);
    res.status(acpStatusFromError(acpError)).json(acpError);
  }
}
