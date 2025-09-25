import { $, findElem, parseHTML } from "../../_/dom.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { findReactProp, getReactPropValue } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import { getParam } from "../../_/url.js";
import { APIInvoice } from "../../api/Invoice/index.js";
import { InvoicesEntity } from "../../api/Invoice/List.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import { openInTab } from "../../GM/openInTab.js";
import { waitPage } from "../../navigation/waitPage.js";

export default class AutoSearchTransaction extends Service {
  private container: HTMLButtonElement;

  protected async init() {
    const refEl = await waitPage("invoiceDetail");
    this.createButton();
    this.watch();
  }

  private createButton(): void {
    this.container = parseHTML(`<button
      class="${getButtonClassName()} auto-find-transaction-button"
      style="margin-left: 1em; padding: .2em;"
    >🔍</button>`).firstElementChild as HTMLButtonElement;
    Tooltip.make({ target: this.container, text: "Chercher une transaction de ce montant" });
    this.container.addEventListener("click", (event) => {
      const amountInput = findElem<HTMLInputElement>('input[name="currency_amount"]')!;
      const filters = [
        {
          field: "amount",
          operator: "abs_eq",
          value: amountInput.value.replace(",", ".").replace(/ /gu, ""),
        },
      ];

      const [minDate, maxDate] = [
        $<HTMLInputElement>('input[name="date"]')!,
        $<HTMLInputElement>('input[name="deadline"]')!,
      ].map((input, id) => {
        if (!input.value) return id ? "2025-12-31" : "2024-01-01";
        return new Date(input.value.split("/").reverse().join("-")).toISOString();
      });
      filters.push(
        {
          field: "date",
          operator: "gteq",
          value: minDate,
        },
        {
          field: "date",
          operator: "lteq",
          value: maxDate,
        }
      );

      const invoiceNumber = $<HTMLInputElement>('input[name="invoice_number"')!;
      const invoice = APIInvoice.Create(getReactPropValue(invoiceNumber, "invoice"));
      const match = invoiceNumber.value.match(/CHQ ?(?:n° ?)?(?<chq_number>\d+)/u)?.groups;
      if (match) {
        if (invoice.direction === "supplier") {
          filters.push({
            field: "label",
            operator: "search",
            value: `CHEQUE ${match.chq_number}`,
          });
        } else {
          filters.push({
            field: "label",
            operator: "search",
            value: `REMISE CHEQUE `,
          });
        }
      }

      const urlRoot = location.href.split("/").slice(0, 6).join("/");
      const url = `${urlRoot}/transactions?filter=${JSON.stringify(
        filters
      )}&per_page=300&sort=-date&sidepanel_tab=reconciliation&period_start=${minDate.slice(
        0,
        4
      )}-01-01&period_end=${maxDate.slice(0, 4)}-12-31`;

      openInTab(url);
      navigator.clipboard.writeText(getParam(location.href, "id"));
    });
  }

  private async watch() {
    const refEl = await waitPage("invoiceDetail");

    const amountInput = findElem<HTMLInputElement>('input[name="currency_amount"]')!;
    amountInput.closest(".ui-form-group").querySelector("label").appendChild(this.container);

    await waitFunc(async () => (await waitPage("invoiceDetail")) !== refEl);
    this.init();
  }
}
