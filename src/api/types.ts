import { APIDocument } from "./Document/index.js";
import { APIGroupedDocument } from "./GroupedDocument/index.js";
import { APIInvoiceList } from "./Invoice/List.js";

type CommonKeys<T, U> = keyof T & keyof U;
type CommonProperties<T, U> = Pick<T, CommonKeys<T, U>>;

export type APIInvoiceItem = APIInvoiceList['invoices'][number];
export type Direction = 'customer'|'supplier';
export type GroupedDocument = CommonProperties<APIGroupedDocument, APIDocument['grouped_documents'][number]>;
