import { Logger } from '../framework/Logger.js';
import { cachedRequest, updateAPICacheItem } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIGroupedDocument } from "./GroupedDocument/index.js";
import { APILedgerEvent } from "./LedgerEvent/index.js";
import { APIOperation } from "./Operation/index.js";

const logger = new Logger("Operation");

export async function getLedgerEvents(id: number, maxAge?: number): Promise<APILedgerEvent[] | null> {
  const data = await cachedRequest(
    "operation:getLedgerEvents",
    { id },
    async ({ id }: { id: number }) => {
      const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, "GET");
      if (!response) {
        logger.error(`Unable to load ledger events for ${id}`);
        return [];
      }
      return await response!.json();
    },
    maxAge
  );
  return data.map((item) => APILedgerEvent.Create(item));
}

export async function getGroupedDocuments(id, maxAge?: number): Promise<APIGroupedDocument[] | null> {
  if (!Number.isSafeInteger(id) || !id) {
    logger.error("getGroupedDocuments: `id` MUST be an integer", { id });
    throw new Error("`id` MUST be an integer");
  }
  const documents = await cachedRequest("operation:getGroupedDocuments", { id }, fetchGroupedDocuments, maxAge);
  documents.forEach((doc) => {
    const ref = "operation:getGroupedDocuments";
    const args = { id: doc.id };
    updateAPICacheItem({ ref, args, value: documents });
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

export async function getOperation(id: number, maxAge?: number): Promise<APIOperation | null> {
  const data = await cachedRequest(
    "operation:getOperation",
    { id },
    async ({ id }: { id: number }) => {
      const response = await apiRequest(`accountants/operations/${id}`, null, "GET");
      if (!response) {
        logger.error(`Unable to load operation for ${id}`);
        return null;
      }
      return await response!.json();
    },
    maxAge
  );
  return APIOperation.Create(data);
}