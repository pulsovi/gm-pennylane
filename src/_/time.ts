export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export async function sleep (ms: number) {
  await new Promise(rs => setTimeout(rs, ms));
}

/**
 * Get a cb function (without edge effect), run it 5 times per seconds
 * and return its first non null result
 *
 * if cb return value is a Promise, the Promise fulfill value will be awaited
 * and tested for non null value.
 */
export function waitFunc <T extends unknown>(cb: () => Promise<T>): Promise<Exclude<T, false>>;
export function waitFunc <T extends unknown>(cb: () => Promise<T>, timeout: number): Promise<T | false>;
export function waitFunc <T extends unknown>(cb: () => T): Promise<Exclude<T, false>>;
export function waitFunc <T extends unknown>(cb: () => T, timeout: number): Promise<T | false>;
export async function waitFunc (cb: () => unknown, timeout = 0) {
  const out = timeout ? Date.now() + timeout : 0;
  let result = cb();
  if (result instanceof Promise) result = await result;
  while (result === false) {
    if (out && Date.now() > out) return false;
    await sleep(200);
    result = await cb();
  }
  return result;
}
