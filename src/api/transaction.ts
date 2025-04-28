import { jsonClone } from '../_/json.js';

import { apiRequest } from './core.js';
import { TransactionsEntity } from './Transaction/List.js';
import { APITransaction, APITransactionList, APITransactionListParams } from './types.js';
/**
 * @return {Promise<RawTransactionMin>}    Type vérifié
 */
export async function getTransaction (id: number): Promise<APITransaction> {
  const response = await apiRequest(`accountants/wip/transactions/${id}`, null, 'GET');
  const data = await response?.json();
  return APITransaction.Create(data);
}

/**
 * Load list of transactions from API. paginated.
 */
export async function getTransactionsList (
  params: APITransactionListParams = {}
): Promise<APITransactionList> {
  const searchParams = new URLSearchParams(APITransactionListParams.Create(params) as Record<string, string>);
  const url = `accountants/wip/transactions?${searchParams.toString()}`;
  const response = await apiRequest(url, null, 'GET');
  return APITransactionList.Create(await response.json());
}

/**
 * Load list of transaction one to one as generator
 */
export async function* getTransactionGenerator (
  params: APITransactionListParams = {}
): AsyncGenerator<TransactionsEntity> {
  let page = Number(params.page ?? 1);
  do {
    const data = await getTransactionsList(Object.assign({}, params, { page }));
    const transactions = data.transactions;
    if (!transactions?.length) return;
    for (const transaction of transactions) yield transaction;
    ++page;
  } while (true);
}

export async function findTransaction (
  cb: (transaction: TransactionsEntity, params: APITransactionListParams & { page: number }) => boolean | Promise<boolean>,
  params: APITransactionListParams = {}
): Promise<APITransaction> {
  if (('page' in params) && !Number.isInteger(params.page)) {
    console.log('findTransaction', { params });
    throw new Error('The "page" parameter must be a valid integer number');
  }

  let parameters = Object.assign(jsonClone(params), {page: params.page ?? 1});

  let data: APITransactionList | null = null;
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
