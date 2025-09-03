import { $, $$, parseHTML } from "../_/dom.js";
import { getReactPropValue } from "../_/react.js";
import { sleep } from "../_/time.js";
import Service from "../framework/Service.js";
import Tooltip from "../framework/Tooltip.js";

export default class FullPeriod extends Service {
  async init() {
    this.watch();
  }

  async watch() {
    const block = await this.getPeriodBlock();
    if (!$(".GM-full-period", block)) this.addButton(block);
    await sleep(100);
    this.watch();
  }

  async getPeriodBlock() {
    const button = $$("button").find((button) =>
      Boolean(getReactPropValue(button, "periodStart"))
    );
    if (!button) {
      await sleep(100);
      return this.getPeriodBlock();
    }
    return button.closest("div");
  }

  addButton(block: HTMLElement) {
    const periodEnd = new Date().getFullYear() + "-12-31";
    const buttonRef = $$("button", block).find((button) =>
      button.getAttribute("aria-label")?.includes("exercice")
    );
    const button = parseHTML(`
      <button class="${
        buttonRef?.className ?? ""
      } GM-full-period">&nbsp;x&nbsp;</button>
    `).firstElementChild as HTMLButtonElement;
    Tooltip.make({ target: button, text: "Tous les exercices" });
    block.insertBefore(button, block.firstChild);
    button.addEventListener("click", () => {
      const url = new URL(location.href);
      url.searchParams.set("period_start", "2022-01-01");
      url.searchParams.set("period_end", periodEnd);
      location.replace(url.toString());
    });
  }
}
