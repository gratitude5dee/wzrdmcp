import { Router } from 'express';
import { buildACPResponse } from '../utils/response.js';

export function createHealthRouter() {
  const router = Router();

  router.get('/', (req, res) => {
    const uptime = process.uptime();
    res.json(
      buildACPResponse(req, {
        status: 'ok',
        uptime,
      })
    );
  });

  return router;
}
