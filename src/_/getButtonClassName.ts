import { findElem } from "./dom";

/**
 * Get className to apply to a button element
 */
export function getButtonClassName () {
  const buttonModel = findElem<HTMLDivElement>('button div', 'Raccourcis')?.parentElement
    ?? $<HTMLButtonElement>('button[type=button]+button');
  const className = buttonModel?.className;
  return className;
}
