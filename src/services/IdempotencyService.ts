import crypto from 'crypto';
import type { OutgoingHttpHeaders } from 'http';
import { createACPError } from '../types/acp.js';

export interface IdempotencyCachedResponse {
  status: number;
  body: unknown;
  headers: OutgoingHttpHeaders;
}

interface IdempotencyEntry {
  key: string;
  paramsHash: string;
  response: IdempotencyCachedResponse;
  expiresAt: number;
}

export class IdempotencyService {
  private cache = new Map<string, IdempotencyEntry>();
  private readonly ttlMs: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(ttlMs = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  private hashParams(params: unknown): string {
    const canonical = JSON.stringify(params ?? {}, Object.keys(params ?? {}).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  async check(
    idempotencyKey: string,
    params: unknown
  ): Promise<IdempotencyCachedResponse | null> {
    const entry = this.cache.get(idempotencyKey);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(idempotencyKey);
      return null;
    }

    const paramsHash = this.hashParams(params);
    if (paramsHash !== entry.paramsHash) {
      throw createACPError(
        'request_not_idempotent',
        'idempotency_key_reused',
        'Idempotency key was reused with different parameters',
        undefined,
        idempotencyKey
      );
    }

    return entry.response;
  }

  async store(
    idempotencyKey: string,
    params: unknown,
    response: IdempotencyCachedResponse
  ): Promise<void> {
    const paramsHash = this.hashParams(params);
    const expiresAt = Date.now() + this.ttlMs;
    this.cache.set(idempotencyKey, {
      key: idempotencyKey,
      paramsHash,
      response,
      expiresAt,
    });
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  startCleanup(intervalMs = 60 * 60 * 1000): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => this.cleanup(), intervalMs).unref();
  }
}
