import { NextFunction, Request, Response } from 'express';
import { IdempotencyService } from '../services/IdempotencyService.js';
import { formatACPError, acpStatusFromError } from '../utils/error-handler.js';

export function createIdempotencyMiddleware(service: IdempotencyService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.header('idempotency-key');

    if (!idempotencyKey) {
      return next();
    }

    try {
      const params = {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        body: req.body,
      };

      const cached = await service.check(idempotencyKey, params);
      if (cached) {
        return res.status(200).json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        void service.store(idempotencyKey, params, body);
        return originalJson(body);
      };

      next();
    } catch (error) {
      const acpError = formatACPError(error, req.headers['request-id'] as string);
      res.status(acpStatusFromError(acpError)).json(acpError);
    }
  };
}
