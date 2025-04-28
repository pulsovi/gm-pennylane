import { $, findElem, waitElem, waitFunc } from '../../_/index.js';
import Service from '../../framework/Service.js';
import { waitPage } from '../../navigation/waitPage.js';

export default class FixTab extends Service {
  async init () {
    await waitPage('invoiceDetail');
    document.addEventListener('keydown', event => this.handleKeyDown(event));
    this.watch();
  }

  handleKeyDown (event: KeyboardEvent) {
    if (event.code !== 'Tab') return;

    const order = this.getOrder(event.target);
    const toSelect = event.shiftKey ? order?.previous : order?.next;
    if (!toSelect || !order) return;

    event.preventDefault();
    event.stopPropagation();

    const currentContainer = order.current.closest('.show.dropdown');
    if (currentContainer) currentContainer.classList.remove('show');

    const toSelectContainer = toSelect.closest('.dropdown');
    if (toSelectContainer) toSelectContainer.classList.add('show');

    toSelect.focus();
    toSelect.setSelectionRange(0, toSelect.value.length);
  }

  getOrder (target: EventTarget | null): {
    current: HTMLInputElement;
    previous: HTMLInputElement | null;
    next: HTMLInputElement | null;
  } | null {
    const orderList = this.getOrderList();
    const currentSelector = orderList.find(selector => $(selector) === target);
    if (!currentSelector) return null;

    const searchList = orderList.slice(orderList.indexOf(currentSelector) + 1)
      .concat(orderList.slice(0, orderList.indexOf(currentSelector)))
    const nextSelector = searchList.find(selector => $(selector));
    const previousSelector = searchList.reverse().find(selector => $(selector));

    return {
      current: $<HTMLInputElement>(currentSelector)!,
      previous: previousSelector ? $<HTMLInputElement>(previousSelector)! : null,
      next: nextSelector ? $<HTMLInputElement>(nextSelector)! : null,
    };
  }

  getOrderList (): string[] {
    if (findElem('button', 'Client')) return [
      '.input-group-prepend+.input-group-append input',
      'input[name="invoice_number"]',
      'input[name="currency_amount"]',
      'input[placeholder="Rechercher"]',
      'input[name="date"]',
      'input[name="deadline"]',
    ];

    return [
      'div[data-testid="thirdpartyAutocompleteAsyncSelect"] input',
      'input[name="invoice_number"]',
      '.input-group-prepend+.input-group-append input',
      'input[name="date"]',
      'input[name="deadline"]',
      'input[name="currency_amount"]',
      'input[name="currency_amount"]+.input-group-append input[placeholder="Rechercher"]',
    ];
  }

  async watch () {
    const ref = await waitElem<HTMLInputElement>('input[name="invoice_number"]');
    ref.focus();
    waitFunc(() => $('input[name="invoice_number"]') !== ref).then(() => this.watch());
  }
}
