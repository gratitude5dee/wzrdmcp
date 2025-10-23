import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ACP_API_VERSION } from '../types/acp.js';

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  let requestId = req.headers['request-id'] as string | undefined;
  if (!requestId) {
    requestId = randomUUID();
    req.headers['request-id'] = requestId;
  }

  res.setHeader('API-Version', ACP_API_VERSION);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Request-Id', requestId);
  next();
}
