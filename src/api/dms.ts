import Logger from '../framework/Logger.js';
import { apiRequest  } from './core.js';
import { APIDMSCreateLink } from './DMS/CreateLink.js';
import { APIDMSItem } from './DMS/Item.js';
import { APIDMSItemLink } from './DMS/ItemLink.js';
import { APIDMSItemList } from './DMS/ItemList.js';
import { APIDMSItemListParams } from './DMS/ItemListParams.js';
import { APIDMSItemSettings } from './DMS/ItemSettings.js';
import { APIDMSLink } from './DMS/Link.js';
import { APIDMSLinkList } from './DMS/LinkList.js';
import { APIDMSUpdateItem } from './DMS/UpdateItem.js';
import { getDocument } from './document.js';

const logger = new Logger('API_DMS');

export async function getDMSLinks (recordId: number, recordType?: string): Promise<APIDMSLink[]> {
  if (!recordType) recordType = (await getDocument(recordId)).type;
  const response = await apiRequest(`dms/links/data?record_ids[]=${recordId}&record_type=${recordType}`, null, 'GET');
  const data = await response?.json();
  if (!data) return data;
  const list = APIDMSLinkList.Create(data);
  return list.dms_links.map(link => APIDMSLink.Create(link));
}

export async function getDMSItem (id: number): Promise<APIDMSItem> {
  const response = await apiRequest(`dms/items/${id}`, null, 'GET');
  const data = await response?.json();
  if (!data) return (await getDMSItemSettings(id)).item;
  return APIDMSItem.Create(data);
}

export async function getDMSItemLinks(dmsFileId: number): Promise<APIDMSItemLink[] | null> {
  const response = await dmsRequest({url: `dms/files/${dmsFileId}/links`});
  const data = await response?.json();
  if (!data) return data;
  if (!Array.isArray(data)) {
    logger.error('réponse inattendue pour getDMSItemLinks', {response, data});
    return null;
  }
  const links = data.map(item => APIDMSItemLink.Create(item));
  return links;
}

export async function getDMSItemSettings(id: number): Promise<APIDMSItemSettings> {
  const response = await apiRequest(`dms/items/settings.json?filter=&item_id=${id}`, null, 'GET');
  const data = await response?.json();
  if (!data) return data;
  return APIDMSItemSettings.Create(data);
}


/**
 * Load list of DMS from API. paginated.
 */
export async function getDMSItemList (
  params: APIDMSItemListParams = {}
): Promise<APIDMSItemList> {
  if ('filter' in params && typeof params.filter !== 'string')
    params = {...params, filter: JSON.stringify(params.filter) };
  params = { ...params, page_name: 'all' };
  const searchParams = new URLSearchParams(APIDMSItemListParams.Create(params) as Record<string, string>);
  const url = `dms/items/data.json?${searchParams.toString()}`;
  const response = await apiRequest(url, null, 'GET');
  return APIDMSItemList.Create(await response.json());
}

/**
 * Update DMS item
 */
export async function updateDMSItem (entry: Partial<APIDMSItem> & {id: number}) {
  const { id, ...value } = entry;
  const response = await apiRequest(`dms/items/${id}`, {dms_item: value}, 'PUT');
  return APIDMSUpdateItem.Create(await response.json());
}

/**
 * Lier un fichier de la DMS
 * https://app.pennylane.com/companies/21936866/dms/links/batch_create
 * {"dms_links":{"record_ids":[580461033],"record_type":"Transaction","dms_file_ids":[48168851],"dms_external_link_ids":[]}}
 * POST
 * */
export async function createDMSLink(dmsFileId: number, recordId: number, recordType?: string) {
  if (!recordType) recordType = (await getDocument(recordId)).type;
  const response = await apiRequest(
    'dms/links/batch_create',
    {dms_links:{record_ids:[recordId], record_type: recordType, dms_file_ids: [dmsFileId]}},
    'POST'
  );
  return APIDMSCreateLink.Create(await response.json());
}


/**
 * Api request without X-... headers
 */
async function dmsRequest (options: RequestInit & { url: string }) {
  return await apiRequest({
    headers: { Accept: 'application/json' },
    method: 'GET',
    ...options,
  });
}
