import { isAwaitKeyword } from "typescript";
import { $, $$, findElem, parseHTML } from "../../_/dom.js";
import { getReactProps } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import Service from "../../framework/Service.js";
import DMSItem from "../../models/DMSItem.js";
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
    await waitPage('DMS');

    const container = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100');
    this.container = parseHTML(`<div class="${container.firstElementChild.className}"></div>`).firstElementChild as HTMLDivElement;
    this.watch();
  }

  async watch() {
    await waitPage('DMS');
    const rightList = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100')
    const ref = getReactProps(rightList, 7).item;

    rightList.insertBefore(this.container, rightList.firstChild);
    const item = new DMSItem(ref);
    const dmsItem = await item.getItem();
    const message = await item.getValidMessage();
    this.container.innerHTML = `#${dmsItem.itemable_id} (${dmsItem.id})<br/>${message}`;
    const isOk = message === 'OK';
    this.container.classList.toggle('bg-warning-100', !isOk);
    this.container.classList.toggle('bg-primary-100', isOk);

    if (!isOk) {
      const input = $<HTMLInputElement>('input[name="name"]');
      input?.focus();
      input?.select();
    }

    await waitFunc(() => getReactProps(rightList, 7)?.item !== ref);
    this.emit('reload');
    this.log('reload');
    this.watch();
  }
}

