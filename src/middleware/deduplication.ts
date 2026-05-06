import crypto from 'crypto';
import { redis } from '../config/redis';
import { Request, Response, NextFunction } from 'express';

export const deduplicateRequest = async (req: Request, res: Response, next: NextFunction) => {
  // hash the method + URL + body together
  const payload = JSON.stringify({ method: req.method, url: req.url, body: req.body });
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  const key = `dedup:${hash}`;

  const existing = await redis.get(key);
  if (existing) {
    // exact same request came in within 5s — return cached response
    return res.status(200).json(JSON.parse(existing));
  }

  // intercept res.json to store the response before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.setex(key, 5, JSON.stringify(body)); // store for 5 seconds
    return originalJson(body);
  };

  next();
};