import { $, findElem, parseHTML } from "../../_/dom.js";
import { getReactProps } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import Service from "../../framework/Service.js";
import ModelFactory from "../../models/Factory.js";
import { waitPage } from "../../navigation/waitPage.js";

/**
 * Display validation status on DMS items
 */
export default class DMSDisplayStatus extends Service {
  private container: HTMLDivElement;

  /**
   * @inheritDoc
   */
  async init() {
    await waitPage("DMSDetail");

    const container = findElem<HTMLDivElement>("div", "Nom du Fichier").closest("div.w-100");
    this.container = parseHTML(`<div class="${container.firstElementChild.className}"></div>`)
      .firstElementChild as HTMLDivElement;
    this.watch();
  }

  async watch() {
    await waitPage("DMSDetail");
    const rightList = findElem<HTMLDivElement>("div", "Nom du Fichier").closest("div.w-100");
    const ref = getReactProps(rightList, 7).item;

    rightList.insertBefore(this.container, rightList.firstChild);
    const item = ModelFactory.getDMSItem(ref);
    const message = await item.getValidMessage();
    const dmsItem = await item.getItem();
    this.container.innerHTML = `${dmsItem.archived_at ? "📦" : ""} #${dmsItem.itemable_id} (${
      dmsItem.id
    })<br/>${message}`;
    const isOk = message === "OK";
    this.container.classList.toggle("bg-warning-100", !isOk);
    this.container.classList.toggle("bg-primary-100", isOk);

    if (!isOk) {
      const input = $<HTMLInputElement>('input[name="name"]');
      input?.focus();
      input?.select();
      const indexes = await item.partialMatch(input.value);
      this.log("partialMatch indexes", indexes, {
        currentValue: input.value,
        matchIndexes: indexes,
        before: input.value.slice(0, indexes[0]),
        match: input.value.slice(indexes[0], indexes[1]),
        after: input.value.slice(indexes[1]),
        template: indexes[2],
      });
      input.selectionStart = indexes[0];
      input.selectionEnd = indexes[1];
    }

    await waitFunc(() => getReactProps(rightList, 7)?.item !== ref);
    this.emit("reload");
    this.log("reload");
    this.watch();
  }
}
