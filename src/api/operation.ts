import { apiRequest } from './core.js';
import { APIGroupedDocument } from './GroupedDocument/index.js';
import { APILedgerEvent } from './LedgerEvent/index.js';

export async function getLedgerEvents (id): Promise<APILedgerEvent[]> {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, 'GET');
  const data = await response!.json();
  return data.map(item => APILedgerEvent.Create(item));
}

export async function getGroupedDocuments (id, page = 1): Promise<APIGroupedDocument[]> {
  if (!Number.isSafeInteger(id) || !id) {
    console.log('getGroupedDocuments', {id});
    throw new Error('`id` MUST be an integer');
  }
  const response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`, null, 'GET');
  const result: unknown[] = await response!.json();
  const list = result.map(item => APIGroupedDocument.Create(item));
  if (list.length === 20) return list.concat(await getGroupedDocuments(id, page + 1));
  return list;
}
