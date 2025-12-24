import { openInTab, OpenInTabControl } from "../GM/openInTab.js";

export function openDocument(documentId: number): OpenInTabControl {
  const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));
  return openInTab(url.toString(), { insert: false });
}
