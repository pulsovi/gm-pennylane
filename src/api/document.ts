import Logger from "../framework/Logger.js";
import { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIDocument } from "./Document/index.js";
import { APIDocumentMatching } from "./Document/Matching.js";
import { APIDocumentMatchingInvoice } from "./Document/MatchingInvoice.js";
import { getInvoice } from "./invoice.js";
import { APIInvoiceFull } from "./Invoice/Full.js";
import { APIInvoiceMatching } from "./Invoice/Matching.js";
import { getTransactionFull } from "./transaction.js";
import { APITransaction } from "./Transaction/index.js";

const logger = new Logger("API:document");

export async function getDocument(id: number, maxAge?: number): Promise<APIDocument | null> {
  if (typeof id !== "number") throw new Error("id must be a number");
  const data = await cachedRequest(
    "document:getDocument",
    { id },
    async ({ id }) => {
      const response = await apiRequest(`documents/${id}`, null, "GET");
      const data = await response?.json();
      return data;
    },
    maxAge
  );
  if (!data) return null;
  return APIDocument.Create(data);
}

export async function getInvoiceFull(id: number, maxAge?: number): Promise<APIInvoiceFull> {
  const data = await cachedRequest(
    "document:getInvoiceFull",
    { id },
    async ({ id }) => {
      const doc = await getDocument(id, maxAge);
      if (!doc) return logger.triggerError(`Unable to load this document #${id}`);
      if (doc.type !== "Invoice") return logger.triggerError(`Expected Invoice document, got ${doc.type}`);
      if (!doc) return doc;
      const response = await apiRequest(
        doc.url
          .split("/")
          .slice(3)
          .join("/")
          .replace(/\?[^=]*=/u, "/"),
        null,
        "GET"
      );
      const data = await response?.json();
      return data;
    },
    maxAge
  );
  if (!data) return data;
  return APIInvoiceFull.Create(data);
}

interface MatchingOptions {
  id: number;
  groups: string | string[];
}
export async function documentMatching(options: MatchingOptions) {
  this.error("deprecated, use matchDocuments() instead", { options });
  debugger;
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

/**
 * Return document's group uuid
 */
export async function getDocumentGuuid(id: number, maxAge?: number): Promise<string> {
  const doc = await getDocument(id, maxAge);
  if (doc.type === "Invoice") return (await getInvoice(id, maxAge)).group_uuid;
  if (doc.type === "Transaction") return (await getTransactionFull(id, maxAge)).group_uuid;
  debugger;
  logger.error(`Unmanaged document type "${doc.type}".`);
  throw new Error(`Unmanaged document type "${doc.type}".`);
}

export async function matchDocuments(id1: number, id2: number): Promise<APIDocumentMatching | null> {
  const doc1 = await getDocument(id1);
  const doc2 = await getDocument(id2);
  if (doc1.type !== "Invoice" && doc2.type !== "Invoice") return null;

  const transaction = doc1.type === "Transaction" ? doc1 : doc2.type === "Transaction" ? doc2 : null;
  const document = transaction === doc1 ? doc2 : transaction === doc2 ? doc1 : null;
  const guuid = document && (await getDocumentGuuid(document.id, 0));

  if (guuid) {
    const args = { unmatch_ids: [], group_uuids: [guuid] };
    const response = await apiRequest(`documents/${transaction.id}/matching`, args, "PUT");
    if (!response) return null;
    return APIDocumentMatching.Create(await response.json());
  }

  logger.error("No document found", { id1, id2, doc1, doc2, transaction, document, guuid });
  debugger;
  return null;
}

export async function getFullDocument(id: number, maxAge?: number): Promise<APIInvoiceFull | APITransaction> {
  if (typeof id !== "number") throw new Error("id must be a number");
  const liteDoc = await getDocument(id);
  if (!liteDoc) return logger.triggerError(`Unable to load this document #${id}`);
  switch (liteDoc.type) {
    case "Transaction":
      return await getTransactionFull(id, maxAge);
    case "Invoice":
      return await getInvoiceFull(id, maxAge);
    default:
      logger.error(`Unsupported document type: ${liteDoc.type}`, { id, liteDoc });
      debugger;
      throw new Error(`Unsupported document type: ${liteDoc.type}`);
  }
}

