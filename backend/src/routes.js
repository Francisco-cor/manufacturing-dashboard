import { Router } from 'express';
import { getAlarms } from './simulator.js';
import { createRateLimit } from './rateLimit.js';

// Allow up to 30 requests per minute per IP on the alarms endpoint
const alarmsLimit = createRateLimit(30, 60_000);

/**
 * @param {{ startedAt: number }} ctx
 * @returns {import('express').Router}
 */
export function createRouter({ startedAt }) {
  const router = Router();

  router.get('/api/alarms', alarmsLimit, (_req, res) => {
    res.json(getAlarms());
  });

  router.get('/health', (_req, res) => {
    res.json({
      status:    'ok',
      uptime:    Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
