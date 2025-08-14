import { APIDocument } from "./Document/index.js";
import { APIGroupedDocument } from "./GroupedDocument/index.js";
import { APIInvoiceList } from "./Invoice/List.js";

export type APIInvoiceItem = APIInvoiceList['invoices'][number];
export type Direction = 'customer'|'supplier';
export type GroupedDocument = APIGroupedDocument | APIDocument['grouped_documents'][number];
