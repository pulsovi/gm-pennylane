import { $, $$, findElem, parseHTML } from "../../_/dom.js";
import { fetchToDataURL } from "../../_/fetch.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { GMXmlHttpRequest } from "../../_/gmXhr.js";
import { rotateImage } from "../../_/image.js";
import { getReactProps } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import { isObject } from "../../_/typing.js";
import { APIDMSItem } from "../../api/DMS/Item.js";
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

    rightList.appendChild(this.container);
    const item = new DMSItem(ref);
    const message = await item.getValidMessage();
    this.container.innerHTML = message;

    await waitFunc(() => getReactProps(rightList, 7).item !== ref);
    this.emit('reload');
    this.log('reload');
    this.watch();
  }
}

