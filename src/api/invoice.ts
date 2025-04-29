import { jsonClone } from '../_/json.js';

import { apiRequest } from './core.js';
import { APIInvoiceToDMS } from './Invoice/ToDMS.js';
import {
  APIInvoice, APIInvoiceListParams, APIInvoiceUpdateResponse, APIInvoiceList, APIInvoiceItem
} from './types.js';

export async function getInvoice(id: number): Promise<APIInvoice | null> {
  if (!id) throw new Error(`Error: getInvoice() invalid id: ${id}`);
  const response = await apiRequest(`accountants/invoices/${id}`, null, 'GET');
  if (!response) return null;
  const data = await response.json();
  return APIInvoice.Create(data.invoice);
}

export async function updateInvoice(
  id: number, data: Partial<APIInvoice>
): Promise<APIInvoiceUpdateResponse> {
  const response = await apiRequest(`/accountants/invoices/${id}`, { invoice: data }, 'PUT');
  const responseData = await response?.json();
  return APIInvoiceUpdateResponse.Create(responseData);
}

/**
 * Get invoice list paginated
 */
export async function getInvoicesList(params: APIInvoiceListParams = {}): Promise<APIInvoiceList> {
  params = APIInvoiceListParams.Create(params);
  if (!params.direction) throw new Error('params.direction is mandatory');
  if ('page' in params && !Number.isSafeInteger(params.page)) {
    console.log('getInvoicesList', { params });
    throw new Error('params.page, if provided, MUST be a safe integer');
  }
  const searchParams = new URLSearchParams(params as Record<string, string>);
  if (!searchParams.has('filter')) searchParams.set('filter', '[]');
  const url = `accountants/invoices/list?${searchParams.toString()}`;
  const response = await apiRequest(url, null, 'GET');
  const data = await response?.json();
  return APIInvoiceList.Create(data);
}

/**
 * Generate all result one by one as generator
 */
export async function* getInvoiceGenerator(
  params: APIInvoiceListParams = {}
): AsyncGenerator<APIInvoiceItem> {
  let page = Number(params.page ?? 1);
  if (!Number.isSafeInteger(page)) {
    console.log('getInvoiceGenerator', { params, page });
    throw new Error('params.page, if provided, MUST be a safe integer');
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
  cb: (invoice: APIInvoiceItem, parameters: P) => Promise<boolean> | boolean, params: P = {} as P
) {
  if (('page' in params) && !Number.isInteger(params.page)) {
    console.log('findInvoice', { cb, params });
    throw new Error('The "page" parameter must be a valid integer number');
  }

  let parameters = jsonClone(params);
  Object.assign(parameters, { page: parameters.page ?? 1 });

  let data: APIInvoiceList | null = null;
  do {
    data = await getInvoicesList(parameters);
    const invoices = data.invoices;
    if (!invoices?.length) return null;
    console.log('findInvoice page', { parameters, data, invoices });
    for (const invoice of invoices) if (await cb(invoice, parameters)) return invoice;
    parameters = Object.assign(jsonClone(parameters), { page: (parameters.page ?? 0) + 1 });
  } while (true);
}

/**
 * Move invoice to DMS
 */
export async function moveToDms (id: number, destId: number): Promise<APIInvoiceToDMS> {
  const url = `accountants/invoices/${id}/move_to_dms?parent_id=${destId}`;
  const response = await apiRequest(url, null, 'PUT');
  return APIInvoiceToDMS.Create({response});
}
