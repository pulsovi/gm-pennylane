import { $, getParam, parseHTML, waitElem, waitFunc } from '../../_';
import { getTransaction } from '../../api/transaction.js';
import Service from '../../framework/Service.js';
import Transaction from '../../models/Transaction.js';

/** Add 'add by ID' button on transaction reconciliation tab */
export default class TransactionAddByIdButton extends Service {
  private transaction: Transaction;

  async init () {
    if ($('.add-by-id-btn')) return;

    const button = await Promise.race([
      waitElem('button', 'Voir plus de factures'),
      waitElem('button', 'Chercher parmi les factures'),
    ]);
    const div = button.closest('.mt-2');

    if (!div) {
      this.log('TransactionAddByIdButton', { button, div });
      throw new Error('Impossible de trouver le bloc de boutons');
    }

    div.insertBefore(
      parseHTML('<div class="btn-sm w-100 btn-primary add-by-id-btn" style="cursor: pointer;">Ajouter par ID</div>'),
      div.lastElementChild
    );
    $('.add-by-id-btn')!.addEventListener('click', () => { this.addById(); });

    await waitFunc(() => !$('.add-by-id-btn'));
    setTimeout(() => this.init(), 0);
  }

  async addById () {
    const transactionId = getParam(location.href, 'transaction_id');
    const id = Number(prompt('ID du justificatif ?'));
    const transaction = await this.getTransaction();
    await transaction.groupAdd(id);
  }

  async getTransaction () {
    const id = Number(getParam(location.href, 'transaction_id'));
    if (this.transaction?.id !== id) {
      this.transaction = new Transaction(await getTransaction(id));
    }
    return this.transaction;
  }
}
