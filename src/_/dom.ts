import { waitFunc } from './time.js';

export function $ <T extends Element>(selector: string) {
  return document.querySelector<T>(selector);
}

export function $$ <T extends Element>(selector: string) {
  return Array.from(document.querySelectorAll<T>(selector));
}

export async function waitElem <T extends Element>(selector: string, content?: string) {
  return await waitFunc(() => findElem(selector, content) ?? false);
}

export function findElem <T extends Element>(selector: string, content?: string) {
  return $$<T>(selector).find(el => !content || el.textContent === content) ?? null;
}
window.findElem = findElem;

export function parentElement (child, steps = 1) {
  let parent = child;
  for (let i = 0; i < steps; ++i) parent = parent?.parentElement;
  return parent;
}
window.parentElement = parentElement;

export function upElement (elem, upCount) {
  let retval = elem;
  for (let i = 0; i < upCount; ++i) retval = retval?.parentElement;
  return retval;
}

/**
 * Parse an HTML string and return a DocumentFragment which can be inserted in the DOM as is
 *
 * @param {string} html The HTML string to parse
 *
 * @return {DocumentFragment} The parsed HTML fragment
 */
export function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}
