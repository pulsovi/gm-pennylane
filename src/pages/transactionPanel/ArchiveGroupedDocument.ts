import { $$, getReactProps, parseHTML, upElement, waitElem, waitFunc } from "../../_";
import Service from "../../framework/Service";
import Invoice from "../../models/Invoice";

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
      parseHTML(`<button class="archive-button ${buttonClass}">&nbsp;x&nbsp;</button>`),
      buttonsBlock.firstElementChild
    );

    buttonsBlock.querySelector('.archive-button')!.addEventListener('click', async () => {
      const invoice = await Invoice.load(id);
      if (!invoice) {
        alert('Impossible de trouver la facture #'+id);
        return;
      }
      const invoiceDoc = await invoice?.getInvoice();
      const docs = await invoice.getGroupedDocuments();
      const transactions = docs.filter(doc => doc.type === 'Transaction').map(doc => `#${doc.id}`);
      await invoice.update({
        invoice_number: `§ ${transactions.join(' - ')} - ${invoiceDoc.invoice_number}`
      });
      await invoice.archive();
      buttonsBlock.closest('.card')?.remove();
      this.log(`archive invoice #${id}`, {invoice});
    });

    upElement(buttonsBlock, 3).querySelector('.flex-grow-1 .d-block:last-child')?.appendChild(
      parseHTML(
        `&nbsp;<span class="invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5">#${id}</span>`
      )
    );
  }
}
