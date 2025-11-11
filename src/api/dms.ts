import Logger from '../framework/Logger.js';
import { cachedRequest } from "./cache.js";
import { apiRequest } from './core.js';
import { APIDMSCreateLink } from './DMS/CreateLink.js';
import { APIDMSItem } from './DMS/Item.js';
import { APIDMSItemLink } from './DMS/ItemLink.js';
import { APIDMSItemList } from './DMS/ItemList.js';
import { APIDMSItemListParams } from './DMS/ItemListParams.js';
import { APIDMSItemSettings } from './DMS/ItemSettings.js';
import { APIDMSLink } from './DMS/Link.js';
import { APIDMSLinkList } from './DMS/LinkList.js';
import { APIDMSToInvoice } from './DMS/ToInvoice.js';
import { APIDMSUpdateItem } from './DMS/UpdateItem.js';
import { getDocument } from './document.js';
import { APIDocument } from './Document/index.js';
import { APIInvoice } from './Invoice/index.js';
import { GroupedDocument } from './types.js';

const logger = new Logger('API_DMS');

/**
 * Get DMS items linked to a record (a document)
 * @param recordId
 * @param recordType
 * @returns
 */
export async function getDMSLinks(recordId: number, recordType?: string, maxAge?: number): Promise<APIDMSLink[]> {
  if (!recordType) recordType = (await getDocument(recordId)).type;
  const data = await cachedRequest(
    "dms:getDMSLinks",
    { recordId, recordType },
    async ({ recordId, recordType }) => {
      const response = await apiRequest(
        `dms/links/data?record_ids[]=${recordId}&record_type=${recordType}`,
        null,
        "GET"
      );
      return await response?.json();
    },
    maxAge
  );
  if (!data) return data;
  const list = APIDMSLinkList.Create(data);
  return list.dms_links.map((link) => APIDMSLink.Create(link));
}

/**
 * Get DMS item
 * @param id
 * @returns
 */
export async function getDMSItem(id: number, maxAge?: number): Promise<APIDMSItem> {
  const data = await cachedRequest(
    "dms:getDMSItem",
    { id },
    async ({ id }: { id: number }) => {
      logger.debug("getDMSItem", { id, maxAge });
      const response = await apiRequest(`dms/items/${id}`, null, "GET");
      const data = await response?.json();
      if (data) return data;

      logger.error("getDMSItem", { id, response, data });
      const settings = await getDMSItemSettings(id, maxAge);
      if (!settings?.item) return null;
      return settings.item;
    },
    maxAge
  );
  return APIDMSItem.Create(data);
}

/**
 * Get list of records (documents) linked to a DMS item
 * @param dmsFileId
 * @returns
 */
export async function getDMSItemLinks(
  /** the DMSItem.itemable_id */
  dmsFileId: number,
  maxAge?: number
): Promise<APIDMSItemLink[]> {
  const data = await cachedRequest(
    "dms:getDMSItemLinks",
    { id: dmsFileId },
    async ({ id }) => {
      const response = await apiRequest(`dms/files/${id}/links`, null, "GET");
      const data = await response?.json();
      if (!Array.isArray(data)) {
        logger.error("réponse inattendue pour getDMSItemLinks", { response, data });
        return [];
      }
      return data;
    },
    maxAge
  );
  return data.map((item) => APIDMSItemLink.Create(item));
}

/**
 * Get DMS item settings
 * @param id
 * @returns
 */
export async function getDMSItemSettings(id: number, maxAge?: number): Promise<APIDMSItemSettings> {
  const data = await cachedRequest(
    "dms:getDMSItemSettings",
    { id },
    async ({ id }: { id: number }) => {
      logger.debug("getDMSItemSettings", { id, maxAge });
      const response = await apiRequest(`dms/items/settings.json?filter=&item_id=${id}`, null, "GET");
      const data = await response?.json();
      if (!data) logger.error("getDMSItemSettings", { id, response, data });
      return data;
    },
    maxAge
  );
  return APIDMSItemSettings.Create(data);
}

/**
 * Generate all result one by one as generator
 */
export async function* getDMSItemGenerator(params: APIDMSItemListParams = {}): AsyncGenerator<APIDMSItem> {
  let page = Number(params.page ?? 1);
  if (!Number.isSafeInteger(page)) {
    console.log("getDMSItemGenerator", { params, page });
    throw new Error("params.page, if provided, MUST be a safe integer");
  }
  do {
    const data = await getDMSItemList(Object.assign({}, params, { page }));
    const items = data.items;
    if (!items?.length) return;
    for (const item of items) yield item;
    ++page;
  } while (true);
}

/**
 * Load list of DMS from API. paginated.
 */
export async function getDMSItemList(params: APIDMSItemListParams = {}): Promise<APIDMSItemList> {
  if ("filter" in params && typeof params.filter !== "string")
    params = { ...params, filter: JSON.stringify(params.filter) };
  params = { ...params, page_name: "all" };
  const searchParams = new URLSearchParams(APIDMSItemListParams.Create(params) as Record<string, string>);
  const url = `dms/items/data.json?${searchParams.toString()}`;
  const response = await apiRequest(url, null, "GET");
  return APIDMSItemList.Create(await response.json());
}

/**
 * Update DMS item
 */
export async function updateDMSItem(entry: Partial<APIDMSItem> & { id: number }) {
  const { id, ...value } = entry;
  const response = await apiRequest(`dms/items/${id}`, { dms_item: value }, "PUT");
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
    "dms/links/batch_create",
    { dms_links: { record_ids: [recordId], record_type: recordType, dms_file_ids: [dmsFileId] } },
    "POST"
  );
  return APIDMSCreateLink.Create(await response?.json());
}


/**
 * Api request without X-... headers
 */
async function dmsRequest(options: RequestInit & { url: string }) {
  return await apiRequest({
    headers: { Accept: 'application/json' },
    method: 'GET',
    ...options,
  });
}

export async function dmsToInvoice(dmsId: string | string[], direction: 'customer' | 'supplier') {
  const signed_ids = Array.isArray(dmsId) ? dmsId : [dmsId];
  const response = await apiRequest(
    'dms/files/convert_to_invoice',
    { upload: { signed_ids, direction } },
    'POST'
  );
  const data = await response?.json();
  if (!data) return data;
  return APIDMSToInvoice.Create(data);
}


export async function getDMSDestId(
  ref: APIInvoice | GroupedDocument | APIDocument
): Promise<{ parent_id: number; direction: string } | null> {
  let direction: string;
  logger.error('todo: réparer cette fonction "getDMSDestId"');
  debugger;
  throw new Error('todo: réparer cette fonction "getDMSDestId"');
  let year = ref.date.slice(0, 4);
  if (ref.type === "Transaction") {
    direction = parseFloat(ref.amount) > 0 ? "customer" : "supplier";
  }

  if (ref.type === "Invoice" && "direction" in ref) {
    direction = ref.direction;
  }

  logger.log("getDMSDestId", { ref, direction, year });
  switch (direction) {
    case "customer":
      switch (year) {
        case "2023":
          return { parent_id: 57983092, direction }; // 2023 - Compta - Clients
        case "2024":
          return { parent_id: 21994051, direction }; // 2024 - Compta - Clients
        case "2025":
          return { parent_id: 21994066, direction }; // 2025 - Compta - Clients Ventes
      }
      break;
    case "supplier":
      switch (year) {
        case "2024":
          return { parent_id: 21994050, direction }; // 2024 - Compta - Fournisseurs
        case "2025":
          return { parent_id: 21994065, direction }; // 2025 - Compta - Achats
      }
      break;
  }
  logger.log("getDMSDestId", { ref });
  return null;
}
