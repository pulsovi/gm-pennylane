import { $, waitElem, findElem, getReactProps, parseHTML, waitFunc, $$, getParam } from '../../_';
import { LedgerEvent } from '../../api/types.js';
import Service from '../../framework/Service.js';
import Transaction from '../../models/Transaction.js';

/** Add validation message on transaction panel */
export default class ValidMessage extends Service {
  private transaction?: Transaction;
  private ledgerEvents: LedgerEvent[] = [];
  private message: string = '⟳';

  async init () {
    await waitElem('h3', 'Transactions');                    // Transactions panel
    await waitElem('.paragraph-body-m+.heading-page.mt-1')   // transaction detail panel
    document.addEventListener('keydown', event => {
      if (findElem('h3', 'Transactions') && event.ctrlKey && event.key === 's') {
        event.preventDefault();
        delete this.transaction;
      }
    })
    while (await waitFunc(async () => !await this.isSync())) {
      await this.loadMessage();
    }
  }

  async loadMessage () {
    this.log('loadMessage', this);
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

    if (ledgerEvents.some((event, id) => this.ledgerEvents[id] !== event)) {
      const logData = { oldEvents: this.ledgerEvents };
      this.ledgerEvents = ledgerEvents;
      this.log('desynchronisé', { ...logData, ...this });
      return false;
    }

    const current = Number(getParam(location.href, 'transaction_id'));
    if (current && current !== this.transaction?.id) {
      this.log('transaction desynchronisée', { current, ...this });
      return false;
    }

    return true;
  }

  async displayHeadband () {
    if (!$('.headband-is-valid')) {
      const detailTab = $('aside div');
      detailTab?.insertBefore(parseHTML(`
        <div><div class="headband-is-valid"></div></div>
      `), detailTab.firstChild);
    }

    const headband = $('.headband-is-valid');
    if (!headband) return;

    headband.innerHTML = `${this.getTransactionId()}${this.message}`;
  }

  getTransactionId () {
    if (!this.transaction?.id) return '';
    return `<span class="transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5">#${this.transaction.id}</span> `;
  }
}

  /** Open next invalid transaction */
  /**
   * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
  getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
   */
