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
        res.status(cached.status);
        for (const [header, value] of Object.entries(cached.headers)) {
          if (value !== undefined) {
            const headerValue = value as Parameters<typeof res.setHeader>[1];
            res.setHeader(header, headerValue);
          }
        }
        return res.json(cached.body);
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        const jsonResponse = originalJson(body);
        void service.store(idempotencyKey, params, {
          status: res.statusCode,
          body,
          headers: res.getHeaders(),
        });
        return jsonResponse;
      };

      next();
    } catch (error) {
      const acpError = formatACPError(error, req.headers['request-id'] as string);
      res.status(acpStatusFromError(acpError)).json(acpError);
    }
  };
}
