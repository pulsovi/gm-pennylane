import { apiRequest  } from './core.js';
import type { APIDocument, RawDocument } from './types.d.js'

export async function getDocument (id): Promise<APIDocument> {
  const response = await apiRequest(`documents/${id}`, null, 'GET');
  const result = await response?.json();
  return result;
}

interface MatchingOptions {
  id: number;
  groups: string | string[];
}
export async function documentMatching (options: MatchingOptions) {
  const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];
  await apiRequest(
    `documents/${options.id}/matching`,
    { matching: { unmatch_ids:[], group_uuids } },
    'PUT'
  );
}

export async function reloadLedgerEvents (id): Promise<RawDocument> {
  const response = await apiRequest(`documents/${id}/settle`, null, 'POST');
  //return await response.json();
  const data = await response.json();
  console.log('reloadLedgerEvents result', { id, data });
  return data;
}

/**
 * @return {Promise<number>} The number of modified documents
 */
export async function archiveDocument (id: number, unarchive = false): Promise<number> {
  const body = { documents: [{id}], unarchive };
  const response = await apiRequest('documents/batch_archive', body, 'POST');
  const responseData = await response?.json();
  return responseData;
}
