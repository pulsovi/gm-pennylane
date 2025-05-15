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

export function openTabService () {
  setInterval(() => {
    const elem = document.querySelector<HTMLDivElement>('div.open_tab');
    if (!elem) return;

    const url = unescape(elem.dataset.url ?? '');
    if (!url) return;

    const options = JSON.parse(unescape(elem.dataset.options ?? '{}')) as GM_openInTabOptions;

    console.log('GM_openInTab', {elem, url});
    GM.openInTab(url, { active: false, insert: true, ...options });
    elem.remove();
  }, 200);
}
