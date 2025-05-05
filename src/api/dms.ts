import { apiRequest  } from './core.js';
import { APIDMSLink } from './DMS/Link.js';
import { APIDMSLinkList } from './DMS/LinkList.js';
import { getDocument } from './document.js';

export async function getDMSLinks (recordId: number, recordType?: string): Promise<APIDMSLink[]> {
  if (!recordType) recordType = (await getDocument(recordId)).type;
  const response = await apiRequest(`dms/links/data?record_ids[]=${recordId}&record_type=${recordType}`, null, 'GET');
  const data = await response?.json();
  if (!data) return data;
  const list = APIDMSLinkList.Create(data);
  return list.dms_links.map(link => APIDMSLink.Create(link));
}
