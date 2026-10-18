// In-memory cache for API route handlers
// Stores data with TTL to avoid duplicate calls to GitHub API and prevent rate limiting

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetchFn();
  memoryCache.set(key, {
    data,
    expiresAt: now + ttlSeconds * 1000,
  });

  return data;
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export const CACHE_TIMES = {
  REPOS: 60,       // 60 seconds
  REPO_STATS: 60,  // 60 seconds
  PRS: 60,         // 60 seconds
  ISSUES: 60,      // 60 seconds
  COMMITS: 180,    // 3 minutes
  USER: 300,       // 5 minutes
  STALE: 120,      // 2 minutes
};
