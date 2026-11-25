/**
 * Dual-Tier Rate Limiter for Serverless & Self-Hosted Deployments
 * Uses Upstash Redis REST API if UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN are configured;
 * otherwise falls back to an in-memory fixed-window bucket for zero-config local/single-node use.
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

/**
 * Extracts client IP preferring proxy-set single headers before multi-hop lists.
 */
export function getClientIp(req: { headers: { get: (name: string) => string | null } }): string {
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  return "unknown-ip";
}

export async function checkRateLimit(
  key: string,
  limit: number = 3,
  windowSeconds: number = 3600
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const redisKey = `rl:${key}`;
      const res = await fetch(`${upstashUrl.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds, "NX"],
          ["PTTL", redisKey],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = Number(data?.[0]?.result ?? 1);
        const ttlMs = Math.max(1000, Number(data?.[2]?.result ?? windowSeconds * 1000));
        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          resetMs: ttlMs,
        };
      }
    } catch {
      // Fallback safely to local memory bucket on transient Redis network failure
    }
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (memoryStore.size > 2000) {
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
