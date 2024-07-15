import { parseHTML } from "../_";

export function openInTab (url: string) {
  document.body.appendChild(
    parseHTML(`<div class="open_tab" data-url="${escape(url)}" style="display: none;"></div>`)
  );
}
