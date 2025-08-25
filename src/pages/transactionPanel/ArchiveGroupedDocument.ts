import { $, $$, getReactProps, parseHTML, upElement, waitElem, waitFunc } from '../../_/index.js';
import Service from '../../framework/Service.js';
import Tooltip from '../../framework/Tooltip.js';
import Invoice from '../../models/Invoice.js';
import { waitPage } from '../../navigation/waitPage.js';
import ValidMessage from './ValidMessage.js';

/** Add "Archive" button on bonded invoice in transaction pannel */
export default class ArchiveGroupedDocument extends Service {
  state: string[];

  async init() {
    this.state = [];
    this.state.push('wait for transaction detail panel');
    await waitPage('transactionDetail');

    this.state.push('wait for items');
    let item = await this.getNext();
    while (true) {
      this.addGroupedActions(item);
      item = await this.getNext();
    }
  }

  private async getNext() {
    return await waitFunc(() =>
      $('.ui-card:not(.GM-archive-grouped-document) a.ui-button.ui-button-secondary+button.ui-button-secondary-danger') ?? false
    );
  }

  addGroupedActions(item: Element) {
    const card = item.closest('.ui-card');
    if (!card) {
      this.error('addGroupedActions : no invoice found', item);
      return;
    }
    card.classList.add('GM-archive-grouped-document');
    const id = getReactProps(card, 2).invoice.id;

    const buttonsBlock = $(`a[href$="${id}.html"]`, card)?.closest('div');
    if (!buttonsBlock) {
      this.error('addGroupedActions : no buttons block found', card);
      return;
    }

    const buttonClass = buttonsBlock.querySelector('button')?.className ?? '';
    this.state.push(`addGroupedActions for #${id}`);
    this.log('addGroupedActions', { card, buttonsBlock, id });

    buttonsBlock.insertBefore(
      parseHTML(`
        <button
          class="dms-button noCaret ui-button ui-button-sm ui-button-secondary ui-button-secondary-primary ui-button-sm-icon-only" aria-haspopup="true" aria-expanded="false" type="button">
          <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DriveFileMoveRoundedIcon" style="font-size: 1rem;"><path d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-8 9.79V14H9c-.55 0-1-.45-1-1s.45-1 1-1h3v-1.79c0-.45.54-.67.85-.35l2.79 2.79c.2.2.2.51 0 .71l-2.79 2.79c-.31.31-.85.09-.85-.36"></path></svg>
        </button>
        <button class="archive-button ${buttonClass}">&nbsp;x&nbsp;</button>
      `),
      buttonsBlock.firstElementChild
    );

    const archiveButton = $<HTMLButtonElement>('.archive-button', buttonsBlock)!;
    Tooltip.make({ target: archiveButton, text: 'Archiver ce justificatif' });
    archiveButton.addEventListener('click', () => this.archive(card));

    const dmsButton = $<HTMLButtonElement>('.dms-button', buttonsBlock)!;
    Tooltip.make({ target: dmsButton, text: 'Envoyer la facture en GED' });
    dmsButton.addEventListener('click', () => this.dms(card));
  }

  private async archive(card: Element) {
    const id = getReactProps(card, 2).invoice.id;
    const buttonsBlock = $(`a[href$="${id}.html"]`, card)!.closest('div');
    if (!buttonsBlock) {
      this.error('archive : no buttons block found', card);
      return;
    }
    const archiveButton = $<HTMLButtonElement>('.archive-button', buttonsBlock)!;
    this.log('archive invoice', { card, id });

    archiveButton.disabled = true;
    archiveButton.classList.add('disabled');
    archiveButton.innerText = '⟳';
    const invoice = await Invoice.load(id);
    if (!invoice) {
      alert('Impossible de trouver la facture #' + id);
      archiveButton.innerText = '⚠';
      return;
    }

    const invoiceDoc = await invoice?.getInvoice();
    const docs = await invoice.getGroupedDocuments();
    const transactions = docs.filter(doc => doc.type === 'Transaction').map(doc => `#${doc.id}`);
    await invoice.update({
      invoice_number: `§ ${transactions.join(' - ')} - ${invoiceDoc.invoice_number}`
    });
    await invoice.archive();
    buttonsBlock.closest('.ui-card')?.remove();
    this.log(`archive invoice #${id}`, { invoice });
    ValidMessage.getInstance().reload();
  }

  private async dms(card: Element) {
    const id = getReactProps(card, 2).invoice.id;
    const buttonsBlock = $(`a[href$="${id}.html"]`, card)!.closest('div')!;
    if (!buttonsBlock) {
      this.error('dms : no buttons block found', card);
      return;
    }
    const dmsButton = $<HTMLButtonElement>('.dms-button', buttonsBlock)!;
    this.log('move to dms', { card, id });

    dmsButton.disabled = true;
    dmsButton.classList.add('disabled');
    dmsButton.innerText = '⟳';
    const invoice = await Invoice.load(id);
    if (!invoice) {
      alert('Impossible de trouver la facture #' + id);
      dmsButton.innerText = '⚠';
      return;
    }
    const dmsItem = await invoice.moveToDms();
    if (!dmsItem) {
      this.error('move to dms error');
      return;
    }
    buttonsBlock.closest('.ui-card')?.remove();
    this.log('moveToDms', { dmsItem });
    ValidMessage.getInstance().reload();
  }
}
