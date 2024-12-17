import { $, getReactProps, waitElem } from "../../_";
import Service from "../../framework/Service.js";
import Invoice from "../../models/Invoice.js";
import InvoiceDisplayInfos from "./DisplayInfos.js";

export default class AllowChangeArchivedInvoiceNumber extends Service {
  async init () {
    await waitElem('h4', 'Ventilation');
    this.watch();
  }

  async watch () {
    document.addEventListener('keyup', async (event: KeyboardEvent) => {
      if (event.code !== 'KeyS' || !event.ctrlKey) return;

      this.log('Ctrl + S pressed');

      const invoiceNumberField = $<HTMLInputElement>('input[name=invoice_number]');
      if (event.target !== invoiceNumberField || !invoiceNumberField) {
        this.log({ invoiceNumberField, eventTarget: event.target });
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      const rawInvoice =
        getReactProps(invoiceNumberField, 27).initialValues ?? // for supplier pieces
        getReactProps(invoiceNumberField, 44).initialValues; // for customer pieces

      if (!rawInvoice.archived) {
        this.log('Invoice is not archived');
        return;
      }

      const invoice = Invoice.from(rawInvoice);
      await invoice.unarchive();
      await invoice.update({ invoice_number: invoiceNumberField.value });
      await invoice.archive();

      InvoiceDisplayInfos.getInstance().reload();
    });
  }
}
