/**
 * cyrb53 from [Generate a Hash from string in Javascript - Stack Overflow](https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480)
 *
 * @since 0.1.7
 */
export function hashString (str: string, seed: number = 0): number {
    let h1: number = 0xdeadbeef ^ seed;
    let h2: number = 0x41c6ce57 ^ seed;

    for (let i = 0; i < str.length; i++) {
        const ch: number = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
