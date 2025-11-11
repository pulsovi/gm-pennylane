import { waitElem } from "../../_/dom.js";
import { findReactProp, getReactProps } from "../../_/react.js";
import Service from "../../framework/Service.js";
import DMSItem from "../../models/DMSItem.js";
import ModelFactory from "../../models/Factory.js";
import { waitPage } from "../../navigation/waitPage.js";

export class DMSListHasLinks extends Service {
  public async init() {
    await waitPage("DMS");
    this.watch();
  }

  private async watch() {
    await waitPage("DMS");
    const cell = await waitElem("tr:not(.GM-has-links) td[role=cell]:nth-child(2) svg");
    await this.manageRow(cell);
    this.watch();
  }

  private async manageRow(cell: HTMLElement) {
    const row = cell.closest("tr");
    row.classList.add("GM-has-links");
    const data = getReactProps(cell, findReactProp(cell, "data"));
    const dmsItem = ModelFactory.getDMSItem(data.row.original);
    const links = await dmsItem.getLinks();
    if (!links.length) cell.parentElement.appendChild(document.createTextNode("x"));
  }
}
