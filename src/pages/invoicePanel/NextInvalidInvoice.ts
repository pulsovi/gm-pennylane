import { $, findElem, jsonClone, waitElem, waitFunc } from '../../_/index.js';
import { getInvoiceGenerator, getInvoicesList } from '../../api/invoice.js';
import { APIInvoiceListParams } from '../../api/Invoice/ListParams.js';
import CacheListRecord from '../../framework/CacheListRecord.js';
import type { Status } from '../../framework/CacheStatus.js';
import OpenNextInvalid from '../../framework/OpenNextInvalid.js';
import Invoice, { NotFoundInvoice } from '../../models/Invoice.js';
import { isPage, waitPage } from '../../navigation/waitPage.js';

interface InvoiceStatus extends Status {
  direction: 'customer' | 'supplier';
}

export default class NextInvalidInvoice extends OpenNextInvalid {
  public id = 'next-invalid-invoice';
  protected storageKey = 'InvoiceValidation';
  protected readonly idParamName = 'id';
  protected cache: CacheListRecord<InvoiceStatus>;

  async init () {
    // Wait for appending button in the matched page before init auto open service
    await this.appendContainer();

    this.cache = CacheListRecord.getInstance<InvoiceStatus>(this.storageKey);
    await super.init();
  }

  protected async *walk (): AsyncGenerator<Status, undefined, void> {
    // Load new added invoices
    for await (const status of this.walkInvoices('supplier', '+')) yield status;
    for await (const status of this.walkInvoices('customer', '+')) yield status;

    // Load old un loaded invoices
    for await (const status of this.walkInvoices('supplier', '-')) yield status;
    for await (const status of this.walkInvoices('customer', '-')) yield status;
  }

  private async *walkInvoices (direction: 'supplier' | 'customer', sort: '+' | '-'): AsyncGenerator<InvoiceStatus> {
    const startFrom = sort === '+' ? 0 : Date.now();
    const limit = this.cache
      .filter({ direction })
      .reduce((acc, status) => Math[sort === '+' ? 'max' : 'min'](status.createdAt, acc), startFrom);
    if (limit || sort === '-') {
      this.log(`Recherche vers le ${sort === '+' ? 'futur' : 'passé'} depuis`, this.cache.find({ createdAt: limit }), { cache: this.cache });
      const operator = sort === '+' ? 'gteq' : 'lteq';
      const value = new Date(limit).toISOString();
      const params: APIInvoiceListParams = {
        direction,
        filter: JSON.stringify([{ field: 'created_at', operator, value }]),
        sort: `${sort}created_at`,
      };
      for await (const invoice of getInvoiceGenerator(params)) {
        const status = await Invoice.from(invoice).getStatus();
        yield { ...status, direction };
      }
    }
  }

  async getStatus (id: number): Promise<Status|null> {
    const invoice = await Invoice.load(id);

    if (!invoice || invoice instanceof NotFoundInvoice) return null; // probablement une facture supprimée

    const status = await invoice.getStatus();
    if (status.message === 'Facture introuvable') return null;

    return status;
  }

  /** Add "next invalid invoice" button on invoices list */
  private async appendContainer () {
    const ref = await waitPage('invoiceDetail');
    const nextButton = await waitElem('div>span+button+button:last-child');
    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);
    waitFunc(() => isPage('invoiceDetail') !== ref).then(() => this.appendContainer());
  }
}
