import { Router } from 'express';
import { getAlarms } from './simulator.js';

/**
 * @param {{ startedAt: number }} ctx
 * @returns {import('express').Router}
 */
export function createRouter({ startedAt }) {
  const router = Router();

  router.get('/api/alarms', (_req, res) => {
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
