import { $, findElem, jsonClone, waitElem, waitFunc } from "../../_";
import { getInvoiceGenerator, getInvoicesList } from "../../api/invoice";
import { InvoiceList, InvoiceListParams } from "../../api/types";
import CacheListRecord from "../../framework/CacheListRecord";
import type { Status } from "../../framework/CacheStatus";
import OpenNextInvalid from "../../framework/OpenNextInvalid";
import Invoice from "../../models/Invoice";

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
    for await (const status of this.walkInvoices('supplier')) yield status;
    for await (const status of this.walkInvoices('customer')) yield status;
  }

  private async *walkInvoices (direction: 'supplier' | 'customer'): AsyncGenerator<InvoiceStatus> {
    // Load new added invoices
    const max = this.cache
      .filter({ direction })
      .reduce((acc, status) => Math.max(status.createdAt, acc), 0);
    if (max) {
      const params: InvoiceListParams = {
        direction,
        filter: JSON.stringify([{ field: 'created_at', operator: 'gteq', value: new Date(max).toISOString() }]),
        sort: '+created_at',
      };
      for await (const invoice of getInvoiceGenerator(params)) {
        const status = await Invoice.from(invoice).getStatus();
        yield { ...status, direction };
      }
    }

    // Load old un loaded invoices
    const min = this.cache
      .filter({ direction })
      .reduce((acc, status) => Math.min(status.createdAt, acc), Date.now());
    this.log('Recherche vers le passé depuis', this.cache.find({ createdAt: min }), { cache: this.cache });
    const params: InvoiceListParams = {
      direction,
      filter: JSON.stringify(
        [{ field: 'created_at', operator: 'lteq', value: new Date(min).toISOString() }]
      ),
      sort: '-created_at',
    };
    for await (const invoice of getInvoiceGenerator(params)) {
      const status = await Invoice.from(invoice).getStatus();
      yield { ...status, direction };
    }
  }

  async getStatus (id: number): Promise<Status|null> {
    const invoice = await Invoice.load(id);

    if (!invoice) return null; // probablement une facture supprimée

    return await invoice.getStatus();
  }

  /** Add "next invalid invoice" button on invoices list */
  private async appendContainer () {
    const ref = await waitElem('h4', 'Ventilation');
    const nextButton = await waitElem('div>span+button+button:last-child');
    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);
    waitFunc(() => findElem('h4', 'Ventilation') !== ref).then(() => this.appendContainer());
  }
}
