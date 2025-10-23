import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { formatACPError, acpStatusFromError } from '../utils/error-handler.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const acpError = formatACPError(error, req.headers['request-id'] as string);
      res.status(acpStatusFromError(acpError)).json(acpError);
    }
  };
}
