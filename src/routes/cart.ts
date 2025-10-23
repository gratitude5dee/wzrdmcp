import { Router } from 'express';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { buildACPResponse } from '../utils/response.js';
import { validateBody } from '../middleware/validation.js';
import { CartMutationSchema } from '../utils/validation.js';
import { createACPError } from '../types/acp.js';

export function createCartRouter(merchantService: MerchantSessionService) {
  const router = Router();

  router.post('/add', validateBody(CartMutationSchema), async (req, res, next) => {
    try {
      const { session_id, productId, quantity } = req.body;
      const result = await merchantService.addItem(session_id, productId, quantity ?? 1);
      res.json(buildACPResponse(req, result));
    } catch (error) {
      next(error);
    }
  });

  router.post('/remove', validateBody(CartMutationSchema), async (req, res, next) => {
    try {
      const { session_id, productId } = req.body;
      const result = await merchantService.removeItem(session_id, productId);
      res.json(buildACPResponse(req, result));
    } catch (error) {
      next(error);
    }
  });

  router.post('/update', validateBody(CartMutationSchema), async (req, res, next) => {
    try {
      const { session_id, productId, quantity } = req.body;
      const result = await merchantService.updateItem(session_id, productId, quantity ?? 1);
      res.json(buildACPResponse(req, result));
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const sessionId = (req.query.session_id as string) ?? (req.header('session-id') ?? undefined);
      if (!sessionId) {
        throw createACPError('invalid_request', 'session_id_missing', 'session_id query parameter is required');
      }

      const cart = await merchantService.getCart(sessionId);
      res.json(buildACPResponse(req, cart));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
