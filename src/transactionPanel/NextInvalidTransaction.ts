import { $, findElem, getParam, getRandomArrayItem, jsonClone, parseHTML, waitElem } from "../_";
import { sleep } from "../_/time";
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
    this.addButton();
  }

  async loadValidations () {
    this.loadCache();
    this.parameters.page = Math.max(1, ...Object.values(this.cache).map(status => status.page));
    await findTransaction(async (rawTransaction, params) => {
      const page = params.page;
      const transaction = new Transaction(rawTransaction);
      this.setItemStatus({ ...await transaction.getStatus(), page });
      return false;
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
    const className = nextButton.className;
    nextButton.parentElement?.insertBefore(parseHTML(
      `<button type="button" class="${className} open-next-invalid-btn">&nbsp;&gt;&nbsp;</button>`
    ), nextButton.previousElementSibling);
    $('.open-next-invalid-btn')!.addEventListener('click', event => {
      event.stopPropagation();
      this.openNext(true);
    });
  }
}
