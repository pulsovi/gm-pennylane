import { waitFunc } from './time.js';

export function $ <T extends Element>(selector: string, root: ParentNode = document) {
  return root.querySelector<T>(selector);
}

export function $$ <T extends Element>(selector: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}

export async function waitElem <T extends Element>(selector: string, content?: string) {
  return await waitFunc(() => findElem(selector, content) ?? false);
}

export function findElem <T extends Element>(selector: string, content?: string) {
  return $$<T>(selector).find(el => !content || el.textContent === content) ?? null;
}

export function parentElement (child, steps = 1) {
  let parent = child;
  for (let i = 0; i < steps; ++i) parent = parent?.parentElement;
  return parent;
}

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

Object.assign(window, { gm: {
  $$,
  $,
  findElem,
  parentElement,
  parseHTML,
  upElement,
  waitElem,
}})
