const styleCache = new Set<string>();

export function injectStyles(css: string, id?: string) {
  if (id && styleCache.has(id)) return;

  const style = document.createElement('style');
  if (id) {
    style.id = id;
    styleCache.add(id);
  }
  style.textContent = css;
  document.head.appendChild(style);
}
