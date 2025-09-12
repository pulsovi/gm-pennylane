import { WEEK_IN_MS } from "../_/time.js";
import CacheListRecord from "../framework/CacheListRecord.js";

export interface APICacheItem {
  /** The API endpoint or function name */
  ref: string;
  /** The API arguments, as JSON stringifiable */
  args: string;
  /** The API response, must be JSON stringifiable */
  value: unknown;
  /** The time the API was fetched */
  fetchedAt: number;
}

export const storageKey = "apiCache";
const cache = CacheListRecord.getInstance<APICacheItem>(storageKey);
export default cache;

export async function cachedRequest<T, Args>(ref: string, args: Args, fetcher: (args: Args) => Promise<T>) {
  const argsString = JSON.stringify(args);
  const cached = cache.find({ ref, args: argsString });
  if (cached && Date.now() - cached.fetchedAt < WEEK_IN_MS) return cached.value as T;
  const value = await fetcher(args);
  cache.updateItem({ ref, args: argsString }, { ref, args: argsString, value, fetchedAt: Date.now() });
  return value;
}
