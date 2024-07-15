import { apiRequest  } from './core.js';
import type { RawDocument } from './types.d.js'

export async function getDocument (id): Promise<RawDocument> {
  const response = await apiRequest(`documents/${id}`, null, 'GET');
  return await response.json();
}
window.getDocument = getDocument;

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

export async function archiveDocument (id: number, unarchive = false) {
  const body = { documents: [{id}], unarchive };
  const response = await apiRequest('documents/batch_archive', body, 'POST');
  const responseData = await response.json();
  console.log('api.archiveDocument', { id, unarchive, body, responseData });
  return responseData;
}
