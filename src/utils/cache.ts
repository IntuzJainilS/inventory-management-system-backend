import { redis } from '../config/redis';

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 60) => {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

// deletes ALL keys matching a pattern e.g. "products:*"
export const cacheDeletePattern = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
};