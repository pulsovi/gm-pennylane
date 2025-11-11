import { $, $$, parseHTML } from "../../_/dom.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { getReactProps } from "../../_/react.js";
import { sleep } from "../../_/time.js";
import { APIDMSLink } from "../../api/DMS/Link.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import DMSItem from "../../models/DMSItem.js";
import ModelFactory from "../../models/Factory.js";
import { waitPage } from "../../navigation/waitPage.js";

export default class MoveDMSToInvoice extends Service {
  async init() {
    await waitPage("transactionDetail");
    this.watch();
  }

  async watch() {
    while (await waitPage("transactionDetail")) {
      const unmanagedDMSItems = $$(".ui-card:not(.GM-to-invoice) span.tiny-caption").filter(
        (span) => !span.classList.contains("GM-to-invoice") && span.innerText.startsWith("ajouté dans la GED le ")
      );
      if (!unmanagedDMSItems.length) {
        await sleep(2000);
        continue;
      }
      for (const span of unmanagedDMSItems) {
        this.debug({ span });
        const files = getReactProps(span, 11).files as APIDMSLink[];
        for (const file of files) await this.manageFile(file);
      }
    }
  }

  async manageFile(file: APIDMSLink) {
    const dmsItem = ModelFactory.getDMSItem(file.item_id);
    const card = $(`a[href$="${file.item_id}"]`)?.closest(".ui-card") as HTMLDivElement;
    const buttonsBlock = $("button", card).closest("div");
    if (card.classList.contains("GM-to-invoice")) return;
    if (!card || !buttonsBlock) {
      this.log("unable to find this file card", { file, status, dmsItem, card, buttonsBlock });
      return;
    }
    card.classList.add("GM-to-invoice");
    this.debug({ buttonsBlock, file, status, card, dmsItem });
    const toInvoiceButton = parseHTML(`<button class="${getButtonClassName()} to-invoice-button">🧾</button>`)
      .firstElementChild as HTMLButtonElement;
    Tooltip.make({ target: toInvoiceButton, text: "Sortir de la GED et envoyer en facturation" });
    buttonsBlock.insertBefore(toInvoiceButton, buttonsBlock.firstChild);
    toInvoiceButton.addEventListener("click", () => this.moveToInvoice(dmsItem, card));
  }

  async moveToInvoice(item: DMSItem, card: HTMLDivElement) {
    const button = $<HTMLButtonElement>(".to-invoice-button", card);
    button.disabled = true;
    button.classList.add("disabled");
    button.innerText = "⟳";
    const invoice = await item.toInvoice();
    if (invoice) card.remove();
    else alert("move to invoice : erreur, voir la console");
    this.log("moveToInvoice", { invoice });
  }
}
