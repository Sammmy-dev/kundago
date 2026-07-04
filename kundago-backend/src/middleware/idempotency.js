import { logger } from '../config/index.js';

const cache = new Map();

const TTL = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key);
  }
}, 10 * 60 * 1000);

export function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const cacheKey = `${req.user?.userId}:${key}`;
  const existing = cache.get(cacheKey);
  if (existing) {
    logger.info('Idempotency cache hit', { cacheKey });
    return res.status(existing.status).json(existing.body);
  }

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    cache.set(cacheKey, {
      status: res.statusCode,
      body,
      expiresAt: Date.now() + TTL,
    });
    return originalJson(body);
  };

  next();
}

export default { idempotencyMiddleware };
