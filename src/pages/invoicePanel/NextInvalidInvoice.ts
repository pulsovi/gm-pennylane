import { $, findElem, jsonClone, waitElem, waitFunc } from "../../_";
import { getInvoicesList } from "../../api/invoice";
import { InvoiceList } from "../../api/types";
import CacheStatus from "../../framework/CacheStatus";
import OpenNextInvalid, { RawStatus as Status } from "../../framework/OpenNextInvalid";
import Invoice from "../../models/Invoice";

export default class NextInvalidInvoice extends OpenNextInvalid {
  public id = 'next-invalid-invoice';
  protected storageKey = 'InvoiceValidation';
  protected readonly idParamName = 'id';
  protected cache: CacheStatus;

  async init () {
    // Wait for appending button in the matched page before init auto open service
    await this.appendContainer();

    this.cache = CacheStatus.getInstance(this.storageKey);
    await super.init();
  }

  protected async *walk (
    params: Record<string, string | number>
  ): AsyncGenerator<Status, undefined, void> {
    if (('page' in params) && !Number.isInteger(params.page)) {
      console.log(this.constructor.name, 'walk', { params });
      throw new Error('The "page" parameter must be a valid integer number');
    }

    let parameters = jsonClone(params);
    parameters.page = parameters.page ?? 1;

    let data: InvoiceList | null = null;
    do {
      data = await getInvoicesList(parameters);
      const invoices = data.invoices;
      if (!invoices?.length) return;
      for (const invoice of invoices) yield Invoice.from(invoice).getStatus();
      parameters = Object.assign(jsonClone(parameters), { page: Number(parameters.page ?? 0) + 1 });
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
