import { $, findElem } from "./dom";

let cachedClassName = '';

/**
 * Get className to apply to a button element
 */
export function getButtonClassName () {
  if (cachedClassName) return cachedClassName;
  const buttonModel = findElem<HTMLDivElement>('button div', 'Raccourcis')?.parentElement
    ?? findElem('div', 'Détails')?.querySelector('button+button:last-child');
  const className = buttonModel?.className ?? '';
  cachedClassName = className;
  return className;
}
