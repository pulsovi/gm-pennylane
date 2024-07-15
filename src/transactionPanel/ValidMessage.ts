import { $, waitElem, parentElement, findElem, getReactProps, parseHTML } from '../_';
import Transaction from '../models/Transaction.js';

/** Add validation message on transaction panel */
export default class ValidMessage {
  private static instance : ValidMessage;
  private transaction: Transaction;
  private message: string = '⟳';

  private constructor () {
    console.log('ValidMessage', this);
    this.init();
  }

  static start () {
    if (ValidMessage.instance) return;
    ValidMessage.instance = new ValidMessage();
  }

  async init () {
    await waitElem('h3', 'Transactions');                    // Transactions panel
    await waitElem('.paragraph-body-m+.heading-page.mt-1')   // transaction detail panel
    this.displayTag();
    this.displayHeadband();

    const rawTransaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;
    this.transaction = new Transaction(rawTransaction);
    this.message = await this.transaction.getValidMessage();
    this.message = `${(await this.transaction.isValid()) ? '✓' : '✗'} ${this.message}`;
    this.displayTag();
    this.displayHeadband();
  }

  async displayTag () {
    const anchor = await waitElem('button', 'Chercher parmi les factures');
    const tagsContainer = parentElement(anchor, 4)?.children[1]?.firstElementChild;
    if (!tagsContainer) throw new Error('Le bouton "Chercher parmi les factures est trouvé, mais pas le "tagsContainer"');

    const tag = $('.tag-is-valid span');
    if (tag) {
      tag.textContent = this.message;
    } else {
      tagsContainer.appendChild(parseHTML(`
        <div class="tag-is-valid sc-aYaIB kSlEke d-inline-block overflow-visible px-0_5 sc-iMTngq haHjuB" role="status">
          <div class="sc-iGgVNO clwwQL d-flex justify-content-evenly align-items-center">
            <span class="text-truncate text-nowrap">${this.message}</span>
          </div>
        </div>
      `));
    }
    if (!await this.transaction.isValid())
      $('.tag-is-valid')?.classList.add('bg-warning-300', 'text-warning-800');
  }

  async displayHeadband () {
    findElem('span', 'Attention !')?.nextElementSibling?.classList.add('headband-is-valid');
    if (!$('.headband-is-valid'))
      $('.paragraph-body-m.text-primary-900.text-truncate')?.classList.add('headband-is-valid');

    const headband = $('.headband-is-valid');
    if (!headband) return;

    headband.textContent = this.message;
  }
}

  /** Open next invalid transaction */
  /**
   * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
  getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
   */
