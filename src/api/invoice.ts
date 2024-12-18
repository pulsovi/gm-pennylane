import { jsonClone } from '../_';

import { apiRequest } from './core.js';
import { APIInvoiceItem, DocumentStatus, InvoiceList, InvoiceListParams, MinRawInvoice, RawInvoice } from './types.js';

export async function getInvoice (id: number): Promise<RawInvoice|null> {
  if (!id) throw new Error(`Error: getInvoice() invalid id: ${id}`);
  const response = await apiRequest(`accountants/invoices/${id}`, null, 'GET');
  if (!response) return null;
  const data = await response.json();
  return data.invoice;
}

export async function updateInvoice (id: number, data: Partial<RawInvoice>): Promise<DocumentStatus> {
  const response = await apiRequest(`/accountants/invoices/${id}`, {invoice: data}, 'PUT');
  const responseData = await response?.json();
  return responseData;
}

export async function getInvoicesList (params: InvoiceListParams = {}): Promise<InvoiceList> {
  if (!params.direction) throw new Error('params.direction is mandatory');
  const searchParams = new URLSearchParams(params as Record<string, string>);
  if (!searchParams.has('filter')) searchParams.set('filter', '[]');
  const url = `accountants/invoices/list?${searchParams.toString()}`;
  const response = await apiRequest(url, null, 'GET');
  return await response?.json();
}

export async function* getInvoiceGenerator (
  params: InvoiceListParams = {}
): AsyncGenerator<APIInvoiceItem> {
  let page = Number(params.page) ?? 1;
  do {
    const data = await getInvoicesList(Object.assign({}, params, { page }));
    const invoices = data.invoices;
    if (!invoices?.length) return;
    for (const invoice of invoices) yield invoice;
    ++page;
  } while (true);
}

export async function findInvoice (
  cb: (invoice: MinRawInvoice, parameters: typeof params) => Promise<boolean> | boolean,
  params: InvoiceListParams = {}
) {
  if (('page' in params) && !Number.isInteger(params.page)) {
    console.log('findInvoice', { cb, params });
    throw new Error('The "page" parameter must be a valid integer number');
  }

  let parameters = jsonClone(params);
  parameters.page = parameters.page ?? 1;

  let data: InvoiceList | null = null;
  do {
    data = await getInvoicesList(parameters);
    const invoices = data.invoices;
    if (!invoices?.length) return null;
    console.log('findInvoice page', {parameters, data, invoices});
    for (const invoice of invoices) if (await cb(invoice, parameters)) return invoice;
    parameters = Object.assign(jsonClone(parameters), { page: (parameters.page ?? 0) + 1 });
  } while (true);
}
