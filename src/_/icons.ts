import { parseHTML } from "./dom.js";

export function openInNewTabIcon (asString?: true): string;
export function openInNewTabIcon (asString: false): SVGSVGElement;
export function openInNewTabIcon (asString?: boolean): string | SVGSVGElement;
export function openInNewTabIcon (asString = true): string | SVGSVGElement {
  return parseIcon(
    '<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="OpenInNewRoundedIcon" style="font-size: 1rem;"><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1"></path></svg>',
    asString
  );
}

function parseIcon(stringHTML: string, asString: false): SVGSVGElement;
function parseIcon(stringHTML: string, asString: true): string;
function parseIcon(stringHTML: string, asString: boolean): string | SVGSVGElement;
function parseIcon(stringHTML: string, asString: boolean): string | SVGSVGElement {
  if (asString) return stringHTML;
  return parseHTML(stringHTML).firstElementChild as SVGSVGElement;
}
