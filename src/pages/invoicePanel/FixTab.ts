import { $, waitElem, waitFunc } from "../../_";
import Service from "../../framework/Service";

export default class FixTab extends Service {
  async init () {
    await waitElem('h4', 'Ventilation');
    document.addEventListener('keydown', event => {
      if (
        event.code === 'Tab'
        && event.shiftKey
        && event.srcElement === $('input[name=currency_amount]')
      ) {
        event.preventDefault();
        event.stopPropagation();
        $<HTMLInputElement>('input[name=date]')?.focus();
      }
    });
    this.watch();
  }

  async watch () {
    const ref = await waitElem<HTMLInputElement>('input[name="invoice_number"]');
    ref.focus();
    waitFunc(() => $('input[name="invoice_number"]') !== ref).then(() => this.watch());
  }
}
