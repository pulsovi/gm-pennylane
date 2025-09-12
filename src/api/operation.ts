import { Logger } from '../framework/Logger.js';
import apiCache, { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIGroupedDocument } from "./GroupedDocument/index.js";
import { APILedgerEvent } from "./LedgerEvent/index.js";

const logger = new Logger("Operation");

export async function getLedgerEvents(id): Promise<APILedgerEvent[] | null> {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, "GET");
  if (!response) {
    logger.error(`Unable to load ledger events for ${id}`);
    return [];
  }
  const data = await response!.json();
  return data.map((item) => APILedgerEvent.Create(item));
}

export async function getGroupedDocuments(id): Promise<APIGroupedDocument[] | null> {
  if (!Number.isSafeInteger(id) || !id) {
    logger.error("getGroupedDocuments: `id` MUST be an integer", { id });
    throw new Error("`id` MUST be an integer");
  }
  const documents = await cachedRequest("operation:getGroupedDocuments", { id }, fetchGroupedDocuments);
  documents.forEach((doc) => {
    const ref = "operation:getGroupedDocuments";
    const args = JSON.stringify({ id: doc.id });
    apiCache.updateItem({ ref, args }, { ref, args, value: documents, fetchedAt: Date.now() });
  });
  return documents;
}

async function fetchGroupedDocuments({ id }: { id: number }): Promise<APIGroupedDocument[] | null> {
  let page = 1;
  const documents: APIGroupedDocument[] = [];
  let response = await apiRequest(
    `accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`,
    null,
    "GET"
  );
  if (!response) {
    // probablement une facture supprimée
    logger.error(`Unable to load grouped documents for ${id}`);
    return [];
  }
  let list: APIGroupedDocument[] = [];
  do {
    const result: unknown[] = await response.json();
    list = result.map((item) => APIGroupedDocument.Create(item));
    documents.push(...list);
    page++;
    response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`, null, "GET");
  } while (response && list.length === 20);
  return documents;
}
