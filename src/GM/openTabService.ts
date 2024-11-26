export function openTabService () {
  setInterval(() => {
    const elem = document.querySelector<HTMLDivElement>('div.open_tab');
    if (!elem) return;

    const url = unescape(elem.dataset.url ?? '');
    if (!url) return;

    console.log('GM_openInTab', {elem, url});
    GM.openInTab(url, { active: false, insert: true });
    elem.remove();
  }, 200);
}
