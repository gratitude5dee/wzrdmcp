import { NextFunction, Request, Response } from 'express';
import { createACPError } from '../types/acp.js';
import { formatACPError, acpStatusFromError } from '../utils/error-handler.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);
const STORE = new Map<string, RateLimitEntry>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.header('authorization') ?? req.ip;
    const now = Date.now();
    const entry = STORE.get(key);

    if (!entry || entry.resetAt <= now) {
      STORE.set(key, { count: 1, resetAt: now + WINDOW_MS });
      res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
      res.setHeader('X-RateLimit-Remaining', String(MAX_REQUESTS - 1));
      res.setHeader('X-RateLimit-Reset', String(Math.floor((now + WINDOW_MS) / 1000)));
      return next();
    }

    if (entry.count >= MAX_REQUESTS) {
      const error = createACPError(
        'rate_limit_exceeded',
        'rate_limit',
        'Too many requests. Please retry later.',
        undefined,
        req.headers['request-id'] as string | undefined
      );
      res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(Math.floor(entry.resetAt / 1000)));
      res.status(acpStatusFromError(error)).json(error);
      return;
    }

    entry.count += 1;
    STORE.set(key, entry);
    res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(MAX_REQUESTS - entry.count, 0)));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(entry.resetAt / 1000)));
    next();
  } catch (error) {
    const acpError = formatACPError(error, req.headers['request-id'] as string);
    res.status(acpStatusFromError(acpError)).json(acpError);
  }
}
