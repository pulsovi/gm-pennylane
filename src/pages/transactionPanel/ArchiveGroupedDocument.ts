import { $$, getReactProps, parseHTML, upElement, waitElem, waitFunc } from '../../_/index.js';
import { moveToDms } from '../../api/invoice.js';
import Service from '../../framework/Service.js';
import Tooltip from '../../framework/Tooltip.js';
import Invoice from '../../models/Invoice.js';
import ValidMessage from './ValidMessage.js';

/** Add "Archive" button on bonded invoice in transaction pannel */
export default class ArchiveGroupedDocument extends Service {
  async init () {
    await waitElem('h3', 'Transactions');

    while (await waitFunc(() =>
      $$('div>a+button>svg').some(svg => !svg.closest('div')?.querySelector('.archive-button'))
    )) this.addInvoiceInfos();
  }

  addInvoiceInfos () {
    const buttonsBlock = $$('div>a+button>svg')
      .find(svg => !svg.closest('div')?.querySelector('.archive-button'))
      ?.closest('div');
    if (!buttonsBlock) {
      this.log('addInvoiceInfos : no invoice found');
      return;
    }

    const buttonClass = buttonsBlock.querySelector('button')?.className ?? '';
    const id = getReactProps(buttonsBlock, 4).invoiceId;

    buttonsBlock.insertBefore(
      parseHTML(`
        `/*<button
          class="dms-button noCaret ui-button ui-button-sm ui-button-secondary ui-button-secondary-primary ui-button-sm-icon-only" aria-haspopup="true" aria-expanded="false" type="button">
          <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DriveFileMoveRoundedIcon" style="font-size: 1rem;"><path d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-8 9.79V14H9c-.55 0-1-.45-1-1s.45-1 1-1h3v-1.79c0-.45.54-.67.85-.35l2.79 2.79c.2.2.2.51 0 .71l-2.79 2.79c-.31.31-.85.09-.85-.36"></path></svg>
        </button>*/+`
        <button class="archive-button ${buttonClass}">&nbsp;x&nbsp;</button>
      `),
      buttonsBlock.firstElementChild
    );

    const archiveButton = buttonsBlock.querySelector<HTMLButtonElement>('.archive-button');
    Tooltip.make({ target: archiveButton, text: 'Archiver ce justificatif' });
    archiveButton!.addEventListener('click', async () => {
      archiveButton.disabled = true;
      archiveButton.classList.add('disabled');
      archiveButton.innerText = '⟳';
      const invoice = await Invoice.load(id);
      if (!invoice) {
        alert('Impossible de trouver la facture #'+id);
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
      this.log(`archive invoice #${id}`, {invoice});
      ValidMessage.getInstance().reload();
    });

    /*
    const dmsButton = buttonsBlock.querySelector<HTMLButtonElement>('.dms-button');
    dmsButton!.addEventListener('click', async () => {
      dmsButton.disabled = true;
      dmsButton.classList.add('disabled');
      dmsButton.innerText = '⟳';
      const invoice = await Invoice.load(id);
      if (!invoice) {
        alert('Impossible de trouver la facture #'+id);
        dmsButton.innerText = '⚠';
        return;
      }
      await moveToDms(
        invoice.id,
        84899227 // 2024/justificatifs Achats
      );
    });
    */

    upElement(buttonsBlock, 3).querySelector('.flex-grow-1 .d-block:last-child')?.appendChild(
      parseHTML(
        `&nbsp;<span class="invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5">#${id}</span>`
      )
    );
  }
}
