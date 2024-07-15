import { $$, getReact, getReactProps, parseHTML, upElement, waitElem, waitFunc } from "../_";
import { archiveDocument } from "../api/document";
import { getInvoice, updateInvoice } from "../api/invoice";
import Service from "../framework/service";
import Invoice from "../models/Invoice";

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
      console.log(this.constructor.name, 'addInvoiceInfos : no invoice found');
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
      const replacement = prompt('ID du justificatif ?');
      await invoice.update({
        invoice_number: `§ ${replacement ? '#'+replacement+' - ' : ''}${invoice.invoice.invoice_number}`
      });
      await invoice.archive();
      console.log(`archive invoice #${id}`, {invoice});
    });

    upElement(buttonsBlock, 3).querySelector('.flex-grow-1 .d-block:last-child')?.appendChild(
      parseHTML(
        `&nbsp;<span class="invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5">#${id}</span>`
      )
    );
  }
}
