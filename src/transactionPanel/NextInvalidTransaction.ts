import { $, findElem, jsonClone, parseHTML, waitElem, waitFunc } from "../_";
import { findTransaction } from "../api/transaction";
import OpenNextInvalid, { Status } from "../framework/OpenNextInvalid";
import Transaction from "../models/Transaction";
import { openDocument } from "../navigation/openDocument";

export default class NextInvalidTransaction extends OpenNextInvalid {
  protected readonly storageKey = 'transactionValidation';
  protected readonly idParamName = 'transaction_id';
  private parameters = { page: 1 };

  async init () {
    await waitElem('h3', 'Transactions');                    // Transactions panel
    super.init();
    while(await waitFunc(() => findElem('div', 'Détails') && !$('.open-next-invalid-btn')))
      this.addButton();
  }

  async loadValidations () {
    this.loadCache();

    // Load last pages
    this.parameters.page = Math.max(1, ...Object.values(this.cache).map(status => status.page));
    await findTransaction(async (rawTransaction, params) => {
      const page = params.page;
      const transaction = new Transaction(rawTransaction);
      const transactionStatus = await transaction.getStatus();
      this.setItemStatus({ ...transactionStatus, page, updatedAt: Date.now() });
      return !transactionStatus.valid;
    }, this.parameters);

    // update oldest items
    if (!Object.keys(this.cache).length) return;
    const oldest = Object.values(this.cache).reduce((a, b) => a.updatedAt < b.updatedAt ? a : b);
    this.parameters.page = oldest.page;
    await findTransaction(async (rawTransaction, params) => {
      const page = params.page;
      const transaction = new Transaction(rawTransaction);
      const transactionStatus = await transaction.getStatus();
      this.setItemStatus({ ...transactionStatus, page, updatedAt: Date.now() });
      return !transactionStatus.valid;
    }, this.parameters);
  }

  async openInvalid (status: Status) {
    const transaction = new Transaction(status.id);
    const message = await transaction.getValidMessage();
    if (message?.includes('écriture')) {
      const data = {oldMessage: message};
      await transaction.reloadLedgerEvents();
      console.log('reload ledger events', {...data, message});
    }
    if (await transaction.isValid()) {
      console.log('transaction is valid', {status, transaction, message});
      this.cache[status.id] = Object.assign(jsonClone(status), {valid: true});
      this.saveCache();
      return false;
    }
    console.log('nextInvalidTransaction', message, { status });
    openDocument(status.id);
    return true;
  }

  /** Add "next invalid transaction" button on invoices list */
  addButton () {
    const nextButton = findElem('div', 'Détails')?.querySelector('button+button:last-child');
    if (!nextButton) return;
    this.loadCache();
    const number = Object.values(this.cache).filter(status => !status.valid).length;
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
