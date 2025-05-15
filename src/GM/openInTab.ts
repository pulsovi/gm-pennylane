import { parseHTML } from '../_/index.js';
import { GM_openInTabOptions } from './openTabService.js';

export function openInTab (url: string, options: GM_openInTabOptions = {}) {
  document.body.appendChild(
    parseHTML(`<div
      class="open_tab"
      data-url="${escape(url)}"
      data-options="${escape(JSON.stringify(options))}"
      style="display: none;"
    ></div>`)
  );
}
