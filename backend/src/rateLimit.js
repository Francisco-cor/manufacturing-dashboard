/**
 * Minimal sliding-window rate limiter — no external dependencies.
 *
 * @param {number} maxRequests  Max requests allowed within the window
 * @param {number} windowMs     Window length in milliseconds
 * @returns {import('express').RequestHandler}
 */
export function createRateLimit(maxRequests, windowMs) {
  /** @type {Map<string, number[]>} */
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();

    // Evict timestamps older than the window
    const timestamps = (hits.get(ip) ?? []).filter(t => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}
