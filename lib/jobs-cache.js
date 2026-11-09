const cache = new Map();
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCachedJobs(cacheKey) {
  const item = cache.get(cacheKey);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > TTL_MS) {
    cache.delete(cacheKey);
    return null;
  }
  
  return item.data;
}

export function setCachedJobs(cacheKey, data) {
  cache.set(cacheKey, {
    timestamp: Date.now(),
    data,
  });
}

export function clearJobsCache() {
  cache.clear();
}
