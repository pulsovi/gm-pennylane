export async function sleep (ms: number) {
  await new Promise(rs => setTimeout(rs, ms));
}

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
