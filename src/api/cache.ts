import { WEEK_IN_MS } from "../_/time.js";
import IDBCache from "../framework/IDBCache.js";
import { PartialRequired } from "./types.js";

export interface APICacheItem {
  /** The API endpoint or function name */
  ref: string;
  /** The API arguments, as JSON stringifiable */
  args: Record<string, unknown>;
  /** The API response, must be JSON stringifiable */
  value: unknown;
  /** The time the API was fetched */
  fetchedAt: number;
}

export const storageKey = "apiCache";
const cache = IDBCache.getInstance<APICacheItem & { key: string }, "key">(storageKey, "key");
export default cache;

export async function cachedRequest<T, Args extends Record<string, unknown>>(
  ref: string,
  args: Args,
  fetcher: (args: Args) => Promise<T>,
  maxAge = WEEK_IN_MS
) {
  const argsString = JSON.stringify(args);
  const key = `${ref}(${argsString})`;
  const cached = await cache.find({ key });
  if (cached && Date.now() - cached.fetchedAt < maxAge) return cached.value as T;
  const value = await fetcher(args);
  if (value) cache.update({ ref, args, value, fetchedAt: Date.now(), key });
  return value;
}

export async function updateAPICacheItem(item: PartialRequired<APICacheItem, "ref" | "args">) {
  const key = `${item.ref}(${JSON.stringify(item.args)})`;
  cache.update({ fetchedAt: Date.now(), ...item, key });
}
