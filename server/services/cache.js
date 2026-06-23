import Redis from 'ioredis';

let redis;
let enabled = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    if (enabled) {
      console.error('[Cache] Redis error:', err.message);
    }
  });

  redis.on('connect', () => {
    enabled = true;
    console.log('[Cache] Redis connected');
  });

  redis.on('close', () => {
    enabled = false;
  });

  redis.connect().catch(() => {
    console.warn('[Cache] Redis unavailable — caching disabled');
  });
} catch {
  console.warn('[Cache] Redis not available — caching disabled');
}

export const getCache = async (key) => {
  if (!enabled) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, data, ttl = 300) => {
  if (!enabled) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch { /* ignore */ }
};

export const delCache = async (pattern) => {
  if (!enabled) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch { /* ignore */ }
};

export { redis, enabled };
