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

      const invoiceNumberField = $<HTMLInputElement>('input[name=invoice_number]');
      if (event.target !== invoiceNumberField || !invoiceNumberField) return;

      this.log('Ctrl + S on invoice number field');

      event.preventDefault(); event.stopImmediatePropagation();
      const rawInvoice = getReactProps(invoiceNumberField, 27).initialValues;
      if (!rawInvoice.archived) return;

      const invoice = Invoice.from(rawInvoice);
      await invoice.unarchive();
      await invoice.update({ invoice_number: invoiceNumberField.value });
      await invoice.archive();

      InvoiceDisplayInfos.getInstance().reload();
    });
  }
}
