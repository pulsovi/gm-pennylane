import { $, waitElem } from "../../_";
import Service from "../../framework/service";

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
  }
}
