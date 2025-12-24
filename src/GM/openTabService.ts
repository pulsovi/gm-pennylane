import { sleep } from "../_/time.js";

export interface GM_openInTabOptions {
  /**
   * if true, the new tab take immediate focus when it opens,
   * @default false
   */
  active?: boolean;

  /**
   * if true, the new tab will opens directly after active tab, else it opens at
   * the end of the tabs list,
   * @default true
   */
  insert?: boolean;
}

export function openTabService() {
  setInterval(() => {
    const elem = document.querySelector<HTMLDivElement>("div.open_tab:not(.parsed)");
    if (!elem) return;

    elem.classList.add("parsed");
    const url = unescape(elem.dataset.url ?? "");
    if (!url) {
      elem.dispatchEvent(new CustomEvent("error", { detail: { message: "No URL" } }));
      return;
    }

    const options = JSON.parse(unescape(elem.dataset.options ?? "{}")) as GM_openInTabOptions;

    const response = GM.openInTab(url, { active: false, insert: true, ...options });
    Promise.resolve(response).then((control) => {
      elem.dispatchEvent(new CustomEvent("success", { detail: { message: "Tab opened" } }));
      elem.addEventListener("close", () => {
        control.close();
        elem.remove();
      });
    });
  }, 200);
}
