import { jsonClone } from '../_';

import { apiRequest } from './core.js';
import { APITransaction, APITransactionItem, RawTransactionMin, TransactionList, TransactionListParams } from './types.js';

/**
 * @return {Promise<RawTransactionMin>}    Type vérifié
 */
export async function getTransaction (id: number): Promise<APITransaction> {
  const response = await apiRequest(`accountants/wip/transactions/${id}`, null, 'GET');
  return await response?.json();
}

/**
 * Load list of transactions from API
 */
export async function getTransactionsList (params: TransactionListParams = {}): Promise<TransactionList> {
  const searchParams = new URLSearchParams(params);
  const url = `accountants/wip/transactions?${searchParams.toString()}`;
  const response = await apiRequest(url, null, 'GET');
  return await response.json();
}

export async function* getTransactionGenerator (
  params: TransactionListParams = {}
): AsyncGenerator<APITransactionItem> {
  let page = Number(params.page) ?? 1;
  do {
    const data = await getTransactionsList(Object.assign({}, params, { page }));
    const transactions = data.transactions;
    if (!transactions?.length) return;
    for (const transaction of transactions) yield transaction;
    ++page;
  } while (true);
}

export async function findTransaction (
  cb: (transaction: RawTransactionMin, params: TransactionListParams & { page: number }) => boolean | Promise<boolean>,
  params: TransactionListParams = {}
) {
  if (('page' in params) && !Number.isInteger(params.page)) {
    console.log('findTransaction', { params });
    throw new Error('The "page" parameter must be a valid integer number');
  }

  let parameters = jsonClone(params);
  parameters.page = parameters.page ?? 1;

  let data: TransactionList | null = null;
  do {
    data = await getTransactionsList(parameters);
    const transactions = data.transactions;
    if (!transactions?.length) return null;
    console.log('findTransaction page', {parameters, data, transactions});
    for (const transaction of transactions) if (await cb(transaction, parameters)) return transaction;
    parameters = Object.assign(jsonClone(parameters), { page: parameters.page + 1 });
  } while (parameters.page <= data.pagination.pages);
  return null;
}
