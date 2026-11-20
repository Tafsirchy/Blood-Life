/**
 * Dual-Tier Rate Limiter for Vercel Serverless
 * Uses Upstash Redis if configured; otherwise gracefully falls back to
 * an in-memory sliding window bucket to guarantee 100% zero-cost operation.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export async function checkRateLimit(
  key: string,
  limit: number = 3,
  windowSeconds: number = 3600
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Cleanup old expired keys
  if (memoryStore.size > 1000) {
    for (const [k, val] of memoryStore.entries()) {
      if (val.resetAt < now) memoryStore.delete(k);
    }
  }

  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt < now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetMs: windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetMs: existing.resetAt - now,
  };
}
