import { $, jsonClone, parseHTML, waitElem, waitFunc } from "../_";
import { findInvoice } from "../api/invoice";
import OpenNextInvalid, { Status } from "../framework/OpenNextInvalid";
import Invoice from "../models/Invoice";
import { openDocument } from "../navigation/openDocument";

export default class NextInvalidInvoice extends OpenNextInvalid {
  protected storageKey: string;
  protected readonly idParamName = 'id';
  private parameters = { direction: 'customer', page: 1 };

  async init () {
    await this.start();
    this.keepActive();
    await super.init();
  }

  async start () {
    await waitElem('h4', 'Ventilation');
    const directionButton = await Promise.race([
      waitElem('button', 'Client'),
      waitElem('button', 'Fournisseur'),
    ]);
    if (directionButton.textContent?.includes('Client')) {
      this.storageKey = 'customerInvoiceValidation';
      this.parameters.direction = 'customer';
    } else {
      this.storageKey ='supplierInvoiceValidation';
      this.parameters.direction = 'supplier';
    }
    this.addButton();
  }

  async keepActive () {
    await this.start();
    await waitFunc(() => !$('.open-next-invalid-btn'));
    setTimeout(() => this.keepActive(), 0);
  }

  async loadValidations () {
    this.loadCache();
    this.parameters.page = Math.max(1, ...Object.values(this.cache).map(status => status.page));
    if (isNaN(this.parameters.page)) {
      console.log(this.constructor.name, this);
    }
    await findInvoice(async (rawInvoice, params) => {
      const page = params.page;
      const invoice = Invoice.from(rawInvoice);
      this.setItemStatus({ ...await invoice.getStatus(), page });
      return false;
    }, this.parameters);
  }

  async openInvalid (status: Status) {
    let invoice = await Invoice.load(status.id);
    if (!invoice) {
      // probablement une facture supprimée
      console.log('NextInvalidInvoice', { status, invoice });
      delete this.cache[status.id];
      this.saveCache();
      console.log(this.constructor.name, `openInvalid: invoice ${status.id} is deleted`);
      return false;
    }
    if (status.message.includes('6288')) {
      const rawInvoice = await invoice.getInvoice();
      await invoice.update({invoice_lines_attributes:[{
        ...rawInvoice.invoice_lines[0],
        pnl_plan_item_id: null,
        pnl_plan_item: null,
      }]});
      invoice = await Invoice.load(status.id);
      if (!invoice) throw new Error(this.constructor.name + ': La facture a disparu ?!');
    }
    if (await invoice.isValid()) {
      console.log(this.constructor.name, 'openInvalid: invoice is valid', {invoice, status});

      this.cache[invoice.id] = Object.assign(
        jsonClone(this.cache[invoice.id]),
        await invoice.getStatus()
      );
      this.saveCache();
      return false;
    }
    openDocument(status.id);
    return true;
  }

  /** Add "next invalid invoice" button on invoices list */
  addButton () {
    this.loadCache();
    const number = Object.values(this.cache).filter(status => !status.valid).length;
    const nextButton = $('div>span+button+button:last-child');
    if (!nextButton) return;
    const className = nextButton.className;
    nextButton.parentElement?.insertBefore(parseHTML(
      `<button type="button" class="${className} open-next-invalid-btn">&nbsp;&gt;&nbsp;${number}</button>`
    ), nextButton.previousElementSibling);
    $('.open-next-invalid-btn')!.addEventListener('click', event => {
      event.stopPropagation();
      this.launched = true;
      this.detachEvents();
      this.openNext(true);
    });
  }
}
