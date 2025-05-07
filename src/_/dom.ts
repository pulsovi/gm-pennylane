import { waitFunc } from './time.js';

export function $ <T extends HTMLElement>(selector: string, root?: ParentNode | null): T | null;
export function $ <T extends HTMLElement>(selector: string, root: ParentNode | null = document) {
  if (root === null) root = document;
  return root.querySelector<T>(selector);
}

export function $$ <T extends HTMLElement>(selector: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}

export async function waitElem <T extends HTMLElement>(selector: string, content?: string): Promise<T>;
export async function waitElem <T extends HTMLElement>(selector: string, content: string, timeout: number): Promise<T | null>;
export async function waitElem <T extends HTMLElement>(selector: string, content?: string, timeout = 0) {
  const result = await waitFunc(() => findElem<T>(selector, content) ?? false, timeout);
  if (result === false) return null;
  return result;
}

export function findElem <T extends HTMLElement>(selector: string, content?: string) {
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
