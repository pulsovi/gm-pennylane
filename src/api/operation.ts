import { Logger } from '../framework/Logger.js';
import { apiRequest } from './core.js';
import { APIGroupedDocument } from './GroupedDocument/index.js';
import { APILedgerEvent } from './LedgerEvent/index.js';

const logger = new Logger('Operation');

export async function getLedgerEvents (id): Promise<APILedgerEvent[] | null> {
  const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, 'GET');
  if (!response) {
    logger.error(`Unable to load ledger events for ${id}`);
    return [];
  }
  const data = await response!.json();
  return data.map(item => APILedgerEvent.Create(item));
}

const groupedDocumentsCache: Record<number, APIGroupedDocument[]> = {};
export async function getGroupedDocuments (id, page = 1): Promise<APIGroupedDocument[] | null> {
  if (!Number.isSafeInteger(id) || !id) {
    logger.error('`id` MUST be an integer', {id});
    throw new Error('`id` MUST be an integer');
  }
  if (page === 1 && groupedDocumentsCache[id]) return groupedDocumentsCache[id];
  const response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`, null, 'GET');
  if (!response) {
    // probablement une facture supprimée
    logger.error(`Unable to load grouped documents for ${id}`);
    return [];
  }
  const result: unknown[] = await response.json();
  const list = result.map(item => APIGroupedDocument.Create(item));
  if (list.length === 20) list.push(...await getGroupedDocuments(id, page + 1));
  if (page === 1) {
    list.forEach(item => {
      groupedDocumentsCache[item.id] = list;
    });
  }
  return list;
}
