import { apiRequest } from "./core";
import { GroupedDocument, LedgerEvent } from "./types";

export async function getLedgerEvents (id): Promise<LedgerEvent[]> {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events`, null, 'GET');
  return await response!.json();
}
Object.assign(window, {getLedgerEvents});

export async function getGroupedDocuments (id): Promise<GroupedDocument[]> {
  const response = await apiRequest(`accountants/operations/${id}/grouped_documents`, null, 'GET');
  return await response!.json();
}
