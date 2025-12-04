import { unstable_cache } from "next/cache";
import { strToBoolean } from "../strToBoolean";

const useCache = strToBoolean(process.env.USE_CACHE) ?? true;

/**
 * Wrapper function of unstable_cache so that it can be disabled through configuration.
 * @param fn
 * @param key
 * @param options
 * @returns
 */
export const withUnstableCache = <Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>,
  key: string[],
  options?: {
    /**
     * The revalidation interval in seconds.
     */
    revalidate?: number | false;
    tags?: string[];
  }
) => {
  if (useCache) {
    return unstable_cache(fn, key, options);
  }
  return async (...args: Args): Promise<Return> => {
    return fn(...args);
  };
};
