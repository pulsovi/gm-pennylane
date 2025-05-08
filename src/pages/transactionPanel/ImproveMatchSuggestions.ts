import { $$, parseHTML } from "../../_/dom.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { openInNewTabIcon } from "../../_/icons.js";
import { getReactProps } from "../../_/react.js";
import { sleep } from "../../_/time.js";
import { getDocumentLink } from "../../api/document.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import { waitPage } from "../../navigation/waitPage.js";

export default class ImproveMatchSuggestions extends Service {
  async init() {
    await waitPage('transactionDetail');
    this.watch();
  }

  async watch() {
    while (await waitPage('transactionDetail')) {
      const unmanagedSuggestionButtons = $$('button')
        .filter(button => !button.className.includes('GM') && button.innerText === 'Réconcilier');
      if (!unmanagedSuggestionButtons.length) {
        await sleep(2000);
        continue;
      }
      for (const button of unmanagedSuggestionButtons) {
        this.log({ button });
        const invoice = getReactProps(button, 20)?.invoice;
        const openInvoiceButton = parseHTML(`<a target="_blank" class="${getButtonClassName()}" href="${getDocumentLink(invoice.id)}">
            ${openInNewTabIcon()}
          </a>`).firstElementChild;
        button.parentElement.insertBefore(openInvoiceButton, button.parentElement.firstElementChild);
        Tooltip.make({ target: openInvoiceButton, text: 'Voir la facture' });
        button.classList.add('GM');
      }
    }
  }
}
