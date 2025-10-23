import { z } from 'zod';
import { ACPError, ACPErrorType, ACP_ERROR_STATUS_CODES, createACPError } from '../types/acp.js';

interface KnownError extends Error {
  type?: ACPErrorType;
  code?: string;
  param?: string;
}

export function isACPError(error: unknown): error is ACPError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'message' in error
  );
}

export function formatACPError(
  error: unknown,
  requestId?: string,
  context?: string
): ACPError {
  if (isACPError(error)) {
    return error;
  }

  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    return createACPError(
      'invalid_request',
      'validation_error',
      'Request validation failed',
      firstIssue?.path.join('.') || undefined,
      requestId
    );
  }

  if (error instanceof Error) {
    const known = error as KnownError;
    if (known.type && known.code) {
      return createACPError(known.type, known.code, known.message, known.param, requestId);
    }

    if (error.message.toLowerCase().includes('rate limit')) {
      return createACPError('rate_limit_exceeded', 'rate_limit', 'Too many requests', undefined, requestId);
    }

    if (error.message.toLowerCase().includes('timeout')) {
      return createACPError('service_unavailable', 'timeout', 'Request timed out', undefined, requestId);
    }
  }

  return createACPError(
    'processing_error',
    'internal_error',
    context ? `${context}: ${String(error)}` : String(error),
    undefined,
    requestId
  );
}

export function acpStatusFromError(error: ACPError): number {
  if (error.code === 'unauthorized') {
    return 401;
  }
  return ACP_ERROR_STATUS_CODES[error.type] ?? 500;
}
