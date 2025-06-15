/**
 * Take a string and a RegExp, search for partial match and return
 * the start and stop indexes of the unmatch portion.
 *
 * @param str The string to search in
 * @param regex The RegExp to search for
 * @returns The start and stop indexes of the unmatch portion
 */
export function regexPartialMatch (str: string, regex: RegExp): [number, number] {
  if (regex.test(str)) return [str.length, str.length];
  const source = regex.source;

  let partialRegex = regex;
  for (let i = 1; i < source.length; ++i) {
    try {
      partialRegex = new RegExp(source.slice(0, -i));
      if (partialRegex.test(str)) break;
    } catch (_error) { /* do nothing */ }
  }
  const start = partialRegex.test(str) ? str.match(partialRegex)[0].length : 0;

  partialRegex = regex;
  for (let i = 0; i < source.length; ++i) {
    try {
      partialRegex = new RegExp(source.slice(i));
      if (partialRegex.test(str)) break;
    } catch (_error) { /* do nothing */ }
  }
  if (!partialRegex.test(str)) return [start, str.length];
  const stop = str.length - str.match(partialRegex)[0].length;

  return [start, stop];
}
