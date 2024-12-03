import { $, findElem, jsonClone, waitElem, waitFunc } from "../../_";
import { getInvoicesList } from "../../api/invoice";
import { InvoiceList } from "../../api/types";
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

  protected async *walk (
    params: Record<string, string | number>
  ): AsyncGenerator<Status, undefined, void> {
    for await (const status of this.walkInvoices('supplier')) yield status;
    for await (const status of this.walkInvoices('customer')) yield status;
  }

  private async *walkInvoices (direction: 'supplier' | 'customer'): AsyncGenerator<InvoiceStatus> {
    const from = this.cache.reduce(
      (acc, status) => status.direction === direction ? Math.max(status.createdAt, acc) : acc,
    0);
    const filter = from ?
      [{ field: 'created_at', operator: 'gteq', value: new Date(from).toISOString() }] :
      [];
    let parameters = {
      direction,
      filter: JSON.stringify(filter),
      sort: '+created_at',
      page: 1,
    };

    this.log('walkInvoices', { direction, from, filter, parameters:{...parameters} });
    let data: InvoiceList | null = null;
    do {
      data = await getInvoicesList(parameters);
      const invoices = data.invoices;
      if (!invoices?.length) break;
      for (const invoice of invoices) {
        const status = await Invoice.from(invoice).getStatus();
        yield { ...status, direction };
      }
      parameters = { ...parameters, page: Number(parameters.page ?? 0) + 1 };
    } while (true);
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
