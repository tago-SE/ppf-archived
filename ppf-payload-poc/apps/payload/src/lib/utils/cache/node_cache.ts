import NodeCache from "node-cache";
import { strToBoolean } from "../strToBoolean";

const DEFAULT_TTL_SECONDS = 60;

const cache = new NodeCache({ stdTTL: DEFAULT_TTL_SECONDS });

const cacheEnabled = strToBoolean(process.env.USE_CACHE) ?? true;

/**
 * Wrapper function of unstable_cache so that it can be disabled through configuration.
 * @param fn
 * @param key
 * @param options
 * @returns
 */
export const withNodeCache = <Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>,
  key: string[],
  options?: {
    /**
     * The revalidation interval in seconds.
     * 1) revalidate: < 0 → No caching at all (bypasses cache every time).
     * 2) revalidate: 0 → Caches indefinitely (must be manually invalidated).
     * 3) revalidate: 10 → Caches for 10 seconds, then expires.
     * 4) revalidate: undefined → Uses DEFAULT_TTL_SECONDS as the default TTL.
     *
     * Removed options:
     * 5) revalidate: true →
     * 6) revalidate: false →
     */
    revalidate?: number;
    /**
     * Not used by node-cache
     */
    tags?: string[];
  }
): ((...args: Args) => Promise<Return>) => {
  const _revalidate = Number(options?.revalidate);
  // Disable cache
  if (!cacheEnabled || (_revalidate !== undefined && _revalidate < 0)) {
    return (...args: Args): Promise<Return> => fn(...args);
  }
  const ttl = _revalidate === undefined ? DEFAULT_TTL_SECONDS : _revalidate;
  const cacheKey = key.join(":");
  return async (...args: Args): Promise<Return> => {
    const cachedData = cache.get<Return>(cacheKey);
    if (!!cachedData) {
      return cachedData;
    }
    const result = await fn(...args);
    if (cacheEnabled) {
      cache.set(cacheKey, result, ttl);
    }
    return result;
  };
};
