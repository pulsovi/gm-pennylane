import { WEEK_IN_MS } from "../_/time.js";
import IDBCache from "../framework/IDBCache.js";
import { PartialRequired } from "../api/types.js";
import Logger from "../framework/Logger.js";

export interface DataCacheItem<T = unknown> {
  /** The function name */
  ref: string;
  /** The function arguments, as JSON stringifiable */
  args: Record<string, unknown>;
  /** The function response, must be JSON stringifiable */
  value: T;
  /** The time the function was fetched */
  fetchedAt: number;
}

export type DataCacheFetchOptions<T, U, Args extends Record<string, unknown>> = {
  /** The function name */
  ref: string;
  /** The function arguments, as JSON stringifiable */
  args: Args;
  /** The maximum age of the cache in milliseconds */
  maxAge?: number;
} & (
  | {
      /** The function to fetch the data */
      fetcher: (args: Args) => Promise<T>;
      /** The function to sanitize the data */
      sanitizer?: (value: T) => U;
    }
  | {
      /** The function to fetch the data */
      fetcher: (args: Args) => Promise<U>;
    }
);

export default class DataCache extends Logger {
  private cache: IDBCache<DataCacheItem & { key: string }, "key">;
  private readonly storageKey: string;
  private static instances: Record<string, DataCache> = {};

  public constructor(storageKey: string) {
    super();
    this.storageKey = storageKey;
    this.cache = IDBCache.getInstance<DataCacheItem & { key: string }, "key">(this.storageKey, "key");
  }

  public static getInstance(storageKey: string) {
    if (!this.instances[storageKey]) {
      this.instances[storageKey] = new DataCache(storageKey);
    }
    return this.instances[storageKey];
  }

  public async fetch<T, U, Args extends Record<string, unknown>>(
    options: DataCacheFetchOptions<T, U, Args>
  ): Promise<U> {
    const { ref, args, fetcher, maxAge = WEEK_IN_MS } = options;
    const argsString = JSON.stringify(args);
    const key = `${ref}(${argsString})`;
    const cached = (await this.cache.find({ key })) as DataCacheItem<T | U> | null;
    if (cached && Date.now() - cached.fetchedAt < maxAge) return this.sanitize(options, cached.value);
    this.debug("fetch", {
      ref,
      args,
      maxAge,
      key,
      cached,
      now: Date.now(),
      age: cached ? Date.now() - cached.fetchedAt : void 0,
    });
    const value = await fetcher(args);
    if (value) this.cache.update({ ref, args, value, fetchedAt: Date.now(), key });
    return this.sanitize(options, value);
  }

  public async update(item: PartialRequired<DataCacheItem, "ref" | "args">) {
    const key = `${item.ref}(${JSON.stringify(item.args)})`;
    this.cache.update({ fetchedAt: Date.now(), ...item, key });
  }

  public async delete(item: PartialRequired<DataCacheItem, "ref" | "args">) {
    const key = `${item.ref}(${JSON.stringify(item.args)})`;
    this.cache.delete({ key });
  }

  private sanitize<T, U>(options: DataCacheFetchOptions<T, U, any>, value: T | U): U {
    if ("sanitizer" in options) return options.sanitizer(value as T);
    return value as U;
  }
}
