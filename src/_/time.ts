export async function sleep (ms: number) {
  await new Promise(rs => setTimeout(rs, ms));
}

export function waitFunc <T extends unknown>(cb: () => Promise<T>): Promise<Exclude<T, false>>;
export function waitFunc <T extends unknown>(cb: () => T): Exclude<T, false> | Promise<Exclude<T, false>>;
export async function waitFunc (cb: () => unknown) {
  let result = cb();
  if (result instanceof Promise) result = await result;
  while (result === false) {
    await sleep(200);
    result = await cb();
  }
  return result;
}
