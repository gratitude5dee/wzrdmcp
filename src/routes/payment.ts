import { Router } from 'express';
import { validateBody } from '../middleware/validation.js';
import { PaymentConfirmSchema, PaymentInitiateSchema } from '../utils/validation.js';
import { PaymentService } from '../services/PaymentService.js';
import { MerchantSessionService } from '../services/MerchantSessionService.js';
import { buildACPResponse } from '../utils/response.js';

export function createPaymentRouter(paymentService: PaymentService, merchantService: MerchantSessionService) {
  const router = Router();

  router.post('/initiate', validateBody(PaymentInitiateSchema), async (req, res, next) => {
    try {
      const { session_id, amount } = req.body;
      const intent = await paymentService.createIntent(session_id, amount);
      res.json(
        buildACPResponse(req, {
          payment_intent_id: intent.id,
          status: intent.status,
          client_secret: intent.client_secret,
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.post('/confirm', validateBody(PaymentConfirmSchema), async (req, res, next) => {
    try {
      const { payment_intent_id, session_id } = req.body;
      const intent = await paymentService.confirmIntent(payment_intent_id);
      if (session_id) {
        await merchantService.markCompleted(session_id);
      }
      res.json(
        buildACPResponse(req, {
          status: intent.status,
          payment_intent_id: intent.id,
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.get('/status/:intentId', async (req, res, next) => {
    try {
      const intent = await paymentService.getIntent(req.params.intentId);
      res.json(
        buildACPResponse(req, {
          status: intent.status,
          payment_intent_id: intent.id,
          amount: intent.amount,
        })
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}
