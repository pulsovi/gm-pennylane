import { jsonClone } from '../_/json.js';
import { cachedRequest } from "./cache.js";

import { apiRequest } from "./core.js";
import { APIInvoice } from "./Invoice/index.js";
import { APIInvoiceList } from "./Invoice/List.js";
import { APIInvoiceListParams } from "./Invoice/ListParams.js";
import { APIInvoiceToDMS } from "./Invoice/ToDMS.js";
import { APIInvoiceUpdateResponse } from "./Invoice/UpdateResponse.js";
import { APIInvoiceItem } from "./types.js";

export async function getInvoice(id: number, maxAge?: number): Promise<APIInvoice | null> {
  if (!id) throw new Error(`Error: getInvoice() invalid id: ${id}`);
  const invoice = await cachedRequest(
    "invoice:getInvoice",
    { id },
    async () => {
      const response = await apiRequest(`accountants/invoices/${id}`, null, "GET");
      if (!response) return null;
      const data = await response.json();
      return data.invoice;
    },
    maxAge
  );
  return invoice ? APIInvoice.Create(invoice) : null;
}

export async function updateInvoice(id: number, data: Partial<APIInvoice>): Promise<APIInvoiceUpdateResponse> {
  const response = await apiRequest(`/accountants/invoices/${id}`, { invoice: data }, "PUT");
  const responseData = await response?.json();
  if (!responseData) return null;
  return APIInvoiceUpdateResponse.Create(responseData);
}

/**
 * Get invoice list paginated
 */
export async function getInvoicesList(
  params: APIInvoiceListParams = { direction: "supplier" }
): Promise<APIInvoiceList> {
  params = APIInvoiceListParams.Create(params);
  if ("page" in params && !Number.isSafeInteger(params.page)) {
    console.log("getInvoicesList", { params });
    throw new Error("params.page, if provided, MUST be a safe integer");
  }

  if ("filter" in params && typeof params.filter !== "string")
    Object.assign(params, { filter: JSON.stringify(params.filter) });

  const searchParams = new URLSearchParams(params as unknown as Record<string, string>);
  if (!searchParams.has("filter")) searchParams.set("filter", "[]");
  const url = `accountants/invoices/list?${searchParams.toString()}`;
  const response = await apiRequest(url, null, "GET");
  const data = await response?.json();
  return APIInvoiceList.Create(data);
}

/**
 * Generate all result one by one as generator
 */
export async function* getInvoiceGenerator(
  params: APIInvoiceListParams = { direction: "supplier" }
): AsyncGenerator<APIInvoiceItem> {
  let page = Number(params.page ?? 1);
  if (!Number.isSafeInteger(page)) {
    console.log("getInvoiceGenerator", { params, page });
    throw new Error("params.page, if provided, MUST be a safe integer");
  }
  do {
    const data = await getInvoicesList(Object.assign({}, params, { page }));
    const invoices = data.invoices;
    if (!invoices?.length) return;
    for (const invoice of invoices) yield invoice;
    ++page;
  } while (true);
}

export async function findInvoice<P extends APIInvoiceListParams>(
  cb: (invoice: APIInvoiceItem, parameters: P) => Promise<boolean> | boolean,
  params: P = {} as P
) {
  if ("page" in params && !Number.isInteger(params.page)) {
    console.log("findInvoice", { cb, params });
    throw new Error('The "page" parameter must be a valid integer number');
  }

  let parameters = jsonClone(params);
  Object.assign(parameters, { page: parameters.page ?? 1 });

  let data: APIInvoiceList | null = null;
  do {
    data = await getInvoicesList(parameters);
    const invoices = data.invoices;
    if (!invoices?.length) return null;
    console.log("findInvoice page", { parameters, data, invoices });
    for (const invoice of invoices) if (await cb(invoice, parameters)) return invoice;
    parameters = Object.assign(jsonClone(parameters), { page: (parameters.page ?? 0) + 1 });
  } while (true);
}

/**
 * Move invoice to DMS
 */
export async function moveToDms(
  id: number,
  destId: { parent_id: number; direction: string }
): Promise<APIInvoiceToDMS> {
  const url = `accountants/invoices/${id}/move_to_dms?parent_id=${destId.parent_id}&direction=${destId.direction}`;
  const response = await apiRequest(url, null, "PUT");
  return APIInvoiceToDMS.Create({ response });
}
