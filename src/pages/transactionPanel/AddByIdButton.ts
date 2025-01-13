import { $, getParam, parseHTML, waitElem, waitFunc } from '../../_';
import Service from '../../framework/Service.js';
import Transaction from '../../models/Transaction.js';
import ValidMessage from './ValidMessage.js';

/** Add 'add by ID' button on transaction reconciliation tab */
export default class TransactionAddByIdButton extends Service {
  private button = parseHTML('<div class="btn-sm w-100 btn-primary add-by-id-btn" style="cursor: pointer;">Ajouter par ID</div>').firstElementChild as HTMLDivElement;

  async init () {
    await this.insertContainer();
    this.attachEvent();
  }

  async insertContainer () {
    const div = (await Promise.race([
      waitElem('button', 'Voir plus de factures'),
      waitElem('button', 'Chercher parmi les factures'),
    ])).closest<HTMLDivElement>('.mt-2');

    if (!div) {
      this.log('TransactionAddByIdButton', { button: await Promise.race([
        waitElem('button', 'Voir plus de factures'),
        waitElem('button', 'Chercher parmi les factures'),
      ]), div });
      throw new Error('Impossible de trouver le bloc de boutons');
    }

    div.insertBefore(this.button, div.lastElementChild);

    waitFunc(async () => {
      const currentDiv = (await Promise.race([
        waitElem('button', 'Voir plus de factures'),
        waitElem('button', 'Chercher parmi les factures'),
      ])).closest<HTMLDivElement>('.mt-2')
      return currentDiv !== div;
    }).then(() => this.insertContainer());
  }

  attachEvent () {
    this.log({ button: this.button });
    this.button.addEventListener('click', () => { this.addById(); });
  }

  async addById () {
    /**
     * Obligé de recharger la transaction à chaque appel : le numéro guid du
     * groupe change à chaque attachement de nouvelle pièce
     */
    const transactionId = Number(getParam(location.href, 'transaction_id'));
    const id = Number(prompt('ID du justificatif ?'));
    const transaction = new Transaction({ id: transactionId });
    await transaction.groupAdd(id);
    ValidMessage.getInstance().reload();
  }
}
