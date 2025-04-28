import { openInTab } from '../GM/openInTab.js';

export function openDocument (documentId: number) {
  const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));
  openInTab(url.toString());
}
