import { parseHTML } from '../_/index.js';
import { GM_openInTabOptions } from './openTabService.js';

export interface OpenInTabControl {
  /** Close the tab and destroy the link */
  close: () => Promise<void>;
  /** Destroy the link without closing the tab */
  destroy: () => void;
}

export function openInTab(url: string, options: GM_openInTabOptions = {}): OpenInTabControl {
  const div = parseHTML(`<div
    class="open_tab"
    data-url="${escape(url)}"
    data-options="${escape(JSON.stringify(options))}"
    style="display: none;"
  ></div>`).firstElementChild as HTMLDivElement;
  document.body.appendChild(div);
  const loading = new Promise<() => void>((rs, rj) => {
    div.addEventListener("success", () => rs(() => div.dispatchEvent(new CustomEvent("close"))));
    div.addEventListener("error", () => rj());
  });
  return { close: () => loading.then((close) => close()), destroy: () => div.remove() };
}
