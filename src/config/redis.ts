import Redis from 'ioredis';

// ── For caching (ioredis) ──────────────────────────────────
// Used by cacheGet / cacheSet / cacheDeletePattern
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis (cache) connected'));

// ── For BullMQ (separate connection) ─────────────────────
// BullMQ REQUIRES maxRetriesPerRequest: null — never share
// this instance with your cache code
export const bullmqRedis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,  // ← this is what BullMQ needs
};