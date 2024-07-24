import { apiRequest } from "./core";

export async function getLedgerEvents (id) {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events`, null, 'GET');
  return await response!.json();
}
window.getLedgerEvents = getLedgerEvents;

export async function getGroupedDocuments (id) {
  const response = await apiRequest(`accountants/operations/${id}/grouped_documents`, null, 'GET');
  return await response!.json();
}
