interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedJobs<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedJobs<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    expiry: Date.now() + TTL,
  });
}
