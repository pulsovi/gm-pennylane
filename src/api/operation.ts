import { apiRequest } from "./core";
import { APILedgerEvent, APIGroupedDocument } from "./types";

export async function getLedgerEvents (id): Promise<APILedgerEvent[]> {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, 'GET');
  return await response!.json();
}
Object.assign(window, {getLedgerEvents});

export async function getGroupedDocuments (id): Promise<APIGroupedDocument[]> {
  if (!Number.isSafeInteger(id) || !id) {
    console.log('getGroupedDocuments', {id});
    throw new Error('`id` MUST be an integer');
  }
  const response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=-1`, null, 'GET');
  const result = await response!.json();
  return result;
}
