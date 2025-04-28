import { $, waitElem, findElem, getReactProps, parseHTML, waitFunc, $$, getParam } from '../../_/index.js';
import { APILedgerEvent } from '../../api/types.js';
import Service from '../../framework/Service.js';
import Transaction from '../../models/Transaction.js';

/** Add validation message on transaction panel */
export default class ValidMessage extends Service {
  private container = parseHTML(`<div><div class="headband-is-valid">⟳</div></div>`)
    .firstElementChild as HTMLDivElement;
  private state: {
    transaction?: Transaction;
    ledgerEvents: APILedgerEvent[];
    comments?: {
      transactionId: number;
      hasComment: boolean;
    }
  } = { ledgerEvents: [] };
  private _message: string = '⟳';

  public static getInstance(): ValidMessage {
    if (!this.instance) this.instance = new this();
    return this.instance as ValidMessage;
  }

  async init() {
    await this.insertContainer();
    this.on('message-change', () => this.displayMessage());
    this.watchReloadHotkey();
    await this.loadMessage();
    setInterval(() => this.watch(), 200);
  }

  async insertContainer() {
    await waitElem('h3', 'Transactions');                    // Transactions panel
    await waitElem('.paragraph-body-m+.heading-page.mt-1')   // transaction detail panel
    const detailTab = await waitElem('aside div');
    detailTab.insertBefore(this.container, detailTab.firstChild);
    waitFunc(() => $('aside div') !== detailTab).then(() => { this.insertContainer(); });
  }

  watchReloadHotkey() {
    document.addEventListener('keydown', event => {
      if (findElem('h3', 'Transactions') && event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        this.reload();
      }
    });
  }

  reload() {
    this.loadMessage();
  }

  set message(html: string) {
    this._message = html;
    this.emit('message-change', html);
  }

  get message(): string {
    return this._message;
  }

  async loadMessage() {
    this.debug('loadMessage', this);
    this.message = '⟳';

    const rawTransaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;
    this.state.transaction = new Transaction(rawTransaction);
    const message = await this.state.transaction.getValidMessage();
    this.message = `${(await this.state.transaction.isValid()) ? '✓' : '✗'} ${message}`;
  }

  async watch() {
    const ledgerEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<APILedgerEvent[]>((events, form) => {
        const formEvents = getReactProps(form.parentElement, 3)?.initialValues?.ledgerEvents ?? [];
        return [...events, ...formEvents];
      }, []);

    if (ledgerEvents.some((event, id) => this.state.ledgerEvents[id] !== event)) {
      const logData = { oldEvents: this.state.ledgerEvents };
      this.state.ledgerEvents = ledgerEvents;
      this.debug('ledgerEvents desynchronisé', { ...logData, ...this });
      this.reload();
    }

    const current = Number(getParam(location.href, 'transaction_id'));
    if (current && current !== this.state.transaction?.id) {
      this.debug('transaction desynchronisée', { current, ...this });
      this.reload();
    }
  }

  async displayMessage() {
    $('.headband-is-valid', this.container)!.innerHTML =
      `${this.getTransactionId()}${this.getCommentLogo()} ${this.message}`;
  }

  getTransactionId() {
    if (!this.state.transaction?.id) return '';
    return `<span class="transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5 m-0">#${this.state.transaction.id}</span>`;
  }

  private getCommentLogo() {
    if (!this.state.transaction) return '';
    if (!this.state.comments || this.state.transaction.id !== this.state.comments.transactionId) {
      this.reloadCommentState();
      return '';
    }
    return this.state.comments.hasComment ?
      '<span class="d-inline-block bg-danger m-0">💬</span>' : '';
  }

  private async reloadCommentState() {
    if (!this.state.transaction) return;
    const transactionId = this.state.transaction.id;
    const transactionDoc = await this.state.transaction.getDocument();
    const transaction = transactionDoc.grouped_documents.find(doc => doc.id === transactionId);
    this.state.comments = {
      transactionId,
      hasComment: Boolean(transaction?.client_comments?.length),
    };
    this.reload();
  }
}

/** Open next invalid transaction */
/**
 * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
 */
