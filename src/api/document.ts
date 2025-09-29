import { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIDocument } from "./Document/index.js";
import { APIDocumentMatching } from "./Document/Matching.js";
import { APIDocumentMatchingInvoice } from "./Document/MatchingInvoice.js";

export async function getDocument(id: number, maxAge?: number): Promise<APIDocument> {
  if (typeof id !== "number") throw new Error("id must be a number");
  const data = await cachedRequest(
    "document:getDocument",
    { id },
    async ({ id }) => {
      const response = await apiRequest(`documents/${id}`, null, "GET");
      return await response?.json();
    },
    maxAge
  );
  if (!data) return data;
  return APIDocument.Create(data);
}

interface MatchingOptions {
  id: number;
  groups: string | string[];
}
export async function documentMatching(options: MatchingOptions) {
  const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];
  const matching = { unmatch_ids: [], group_uuids };
  const document = await getDocument(options.id);
  if (document && document.type === "Invoice") {
    const response = await apiRequest(
      `accountants/matching/invoices/matches/${document.id}?direction=${document.direction}`,
      matching,
      "PUT"
    );
    if (response) return APIDocumentMatchingInvoice.Create(await response.json());
  }
  const response = await apiRequest(`documents/${options.id}/matching`, { matching }, "PUT");
  if (!response) return null;
  return APIDocumentMatching.Create(await response.json());
}

export async function reloadLedgerEvents(id): Promise<APIDocument> {
  const response = await apiRequest(`documents/${id}/settle`, null, "POST");
  const data = await response?.json();
  return APIDocument.Create(data);
}

/**
 * @return {Promise<number>} The number of modified documents
 */
export async function archiveDocument(id: number, unarchive = false): Promise<number> {
  const body = { documents: [{ id }], unarchive };
  const response = await apiRequest("documents/batch_archive", body, "POST");
  const responseData = await response?.json();
  return responseData;
}

/**
 * Return http link to open a document
 */
export function getDocumentLink(id: number): string {
  return `${location.href.split("/").slice(0, 5).join("/")}/documents/${id}.html`;
}
