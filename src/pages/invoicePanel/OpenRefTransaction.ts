import { $, findElem, parseHTML } from "../../_/dom.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { openInNewTabIcon } from "../../_/icons.js";
import { sleep, waitFunc } from "../../_/time.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import { openInTab } from "../../GM/openInTab.js";
import { waitPage } from "../../navigation/waitPage.js";

export default class OpenRefTransaction extends Service {
  private container: HTMLButtonElement;

  protected async init() {
    await waitPage("invoiceDetail");
    this.createButton();
    this.watch();
  }

  private createButton(): void {
    this.container = parseHTML(`<button
      class="${getButtonClassName()} auto-find-transaction-button"
      style="margin-left: 1em; padding: .2em;"
    >${openInNewTabIcon()}</button>`).firstElementChild as HTMLButtonElement;
    const tooltip = Tooltip.make({
      target: this.container,
      text: 'Ouvrir la reference dans un nouvel onglet'
    });
    this.container.addEventListener('click', async event => {
      const invoiceNumber = findElem<HTMLInputElement>('input[name="invoice_number"]')!.value;
      const refId = invoiceNumber.match(/§ ?#(?<refId>\d*)(?: |$)/u)?.groups.refId;
      if (!refId) {
        event.preventDefault();
        event.stopPropagation();
        const mainText = tooltip.getHTML();
        tooltip.setText('aucune transaction trouvée');
        await sleep(2000);
        tooltip.setText(mainText, true);
        return;
      }
      const urlRoot = location.href.split('/').slice(0, 5).join('/');
      const url = `${urlRoot}/documents/${refId}.html`;
      openInTab(url);
    }, true);
  }

  private async watch() {
    const refEl = await waitPage("invoiceDetail");

    const invoiceNumber = findElem<HTMLInputElement>('input[name="invoice_number"]')!;
    invoiceNumber.closest('.form-group').querySelector('label').appendChild(this.container);

    await waitFunc(async () => await waitPage('invoiceDetail') !== refEl);
    this.init();
  }
}
