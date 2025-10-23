import { NextFunction, Request, Response } from 'express';
import { ACPError } from '../types/acp.js';
import { formatACPError, acpStatusFromError } from '../utils/error-handler.js';
import { logError } from '../utils/logger.js';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.headers['request-id'] as string;
  const acpError = formatACPError(err, requestId);
  const status = acpStatusFromError(acpError);

  logError('Unhandled error', {
    request_id: requestId,
    error: {
      message: err.message,
      stack: err.stack,
    },
  });

  res.status(status).json(acpError satisfies ACPError);
}
