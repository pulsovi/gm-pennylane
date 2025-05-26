import { $, findElem, parseHTML, waitElem } from "../../_/dom.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { getReactProps } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import DMSItem from "../../models/DMSItem.js";
import { openDocument } from "../../navigation/openDocument.js";
import { waitPage } from "../../navigation/waitPage.js";

/**
 * Allow to rotate preview img of attachment pieces
 */
export default class DMSToInvoiceButton extends Service {
  private toInvoiceButton: HTMLButtonElement;

  /**
   * @inheritDoc
   */
  async init() {
    await waitPage('DMS');
    this.createButton();
    this.watch();
  }

  async watch() {
    await waitPage('DMS');

    const div = await waitElem('div', 'Liens avec la comptabilité');
    const buttonRef = $('button', div.nextElementSibling);
    buttonRef.parentElement.insertBefore(this.toInvoiceButton, buttonRef);

    const rightList = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100')
    const ref = getReactProps(rightList, 7).item;
    await waitFunc(() => {
      if (!this.toInvoiceButton.className) this.toInvoiceButton.className = getButtonClassName();
      return getReactProps(rightList, 7).item !== ref;
    });
    this.emit('reload');
    this.log('reload');
    this.watch();
  }

  createButton () {
     this.toInvoiceButton = (parseHTML(`<button class="${getButtonClassName()}" style="padding: 0.5em 0.6em;">🧾</button>`).firstElementChild) as HTMLButtonElement;
     Tooltip.make({target: this.toInvoiceButton, text: 'Envoyer en facturation' });
     this.toInvoiceButton.addEventListener('click', () => this.moveToInvoice());
  }

  async moveToInvoice () {
    const rightList = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100')
    const ref = getReactProps(rightList, 7).item;
    const item = new DMSItem(ref);
    const invoice = await item.toInvoice();
    openDocument(invoice.id);
  }
}

