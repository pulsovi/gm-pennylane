import { $, waitElem, findElem, getReactProps, parseHTML, waitFunc, $$, getParam } from '../../_';
import { LedgerEvent } from '../../api/types.js';
import Service from '../../framework/service.js';
import Transaction from '../../models/Transaction.js';

/** Add validation message on transaction panel */
export default class ValidMessage extends Service {
  private transaction: Transaction;
  private events: LedgerEvent[] = [];
  private message: string = '⟳';

  async init () {
    await waitElem('h3', 'Transactions');                    // Transactions panel
    await waitElem('.paragraph-body-m+.heading-page.mt-1')   // transaction detail panel
    while (await waitFunc(async () => !await this.isSync())) {
      await this.loadMessage();
    }
  }

  async loadMessage () {
    console.log(this.constructor.name, 'loadMessage', this);
    this.message = '⟳';
    this.displayHeadband();

    const rawTransaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;
    this.transaction = new Transaction(rawTransaction);
    this.message = await this.transaction.getValidMessage();
    this.message = `${(await this.transaction.isValid()) ? '✓' : '✗'} ${this.message}`;
    this.displayHeadband();
  }

  async isSync () {
    const ledgerEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<LedgerEvent[]>((events, form) => {
        const formEvents = getReactProps(form.parentElement ,3)?.initialValues.ledgerEvents;
        return [...events, ...formEvents];
      }, []);

    if (ledgerEvents.some((event, id) => this.events[id] !== event)) {
      const logData = { oldEvents: this.events };
      this.events = ledgerEvents;
      console.log(this.constructor.name, 'desynchronisé', { ...logData, ...this });
      return false;
    }

    const current = Number(getParam(location.href, 'transaction_id'));
    if (current && current !== this.transaction?.id) {
      console.log(this.constructor.name, 'transaction desynchronisée', { current, ...this });
      return false;
    }

    return true;
  }

  async displayHeadband () {
    findElem('span', 'Attention !')?.nextElementSibling?.classList.add('headband-is-valid');

    if (!$('.headband-is-valid'))
      $('.paragraph-body-m.text-primary-900.text-truncate')?.classList.add('headband-is-valid');

    if (!$('.headband-is-valid')) {
      const detailTab = $('aside div');
      detailTab?.insertBefore(parseHTML(`
        <div><div class="headband-is-valid"></div></div>
      `), detailTab.firstChild);
    }

    const headband = $('.headband-is-valid');
    if (!headband) return;

    headband.innerHTML = this.message;
  }
}

  /** Open next invalid transaction */
  /**
   * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
  getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
   */
