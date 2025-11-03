import { $, findElem, jsonClone, parseHTML, waitElem, waitFunc } from '../../_/index.js';
import { getDMSItemGenerator } from '../../api/dms.js';
import { APIDMSItemListParams } from '../../api/DMS/ItemListParams.js';
import { getInvoiceGenerator, getInvoicesList } from '../../api/invoice.js';
import { APIInvoiceListParams } from '../../api/Invoice/ListParams.js';
import CacheListRecord from '../../framework/CacheListRecord.js';
import IDBCache from "../../framework/IDBCache.js";
import OpenNextInvalid, { OpenNextInvalid_ItemStatus } from "../../framework/OpenNextInvalid.js";
import { openInTab } from "../../GM/openInTab.js";
import DMSItem, { DMSItemStatus } from "../../models/DMSItem.js";
import Invoice, { NotFoundInvoice } from "../../models/Invoice.js";
import { isPage, waitPage } from "../../navigation/waitPage.js";

interface Status extends OpenNextInvalid_ItemStatus {
  createdAt: number;
}

export default class NextInvalidDMS extends OpenNextInvalid {
  public id = "next-invalid-dms";
  protected storageKey = "DMSValidation";
  /** The location search param name of the currently showed item id. */
  protected readonly idParamName = "item_id";
  protected containerWrapper: HTMLDivElement;
  protected cache: IDBCache<Status, "id", number>;

  async init() {
    // Wait for appending button in the matched page before init auto open service
    await this.appendContainer();

    this.cache = IDBCache.getInstance<Status, "id", number>(this.storageKey, "id");
    await super.init();
  }

  protected async *walk(): AsyncGenerator<Status, undefined, void> {
    // Load new added items
    for await (const status of this.walkItems("+")) yield status;

    // Load old unloaded items
    for await (const status of this.walkItems("-")) yield status;
  }

  private async *walkItems(sort: "+" | "-"): AsyncGenerator<Status> {
    const startFrom = sort === "+" ? 0 : Date.now();
    const limit = await this.cache.reduce(
      (acc, status) => Math[sort === "+" ? "max" : "min"](status.createdAt, acc),
      startFrom
    );
    if (limit || sort === "-") {
      this.log(`Recherche vers le ${sort === "+" ? "futur" : "passé"} depuis`, this.cache.find({ createdAt: limit }), {
        cache: this.cache,
      });
      const operator = sort === "+" ? "gteq" : "lteq";
      const value = new Date(limit).toISOString();
      const params: APIDMSItemListParams = {
        filter: JSON.stringify([{ field: "created_at", operator, value }]),
        sort: `${sort}created_at`,
      };
      for await (const dmsItem of getDMSItemGenerator(params)) {
        const status = await new DMSItem(dmsItem).getStatus();
        yield { ...status };
      }
    }
  }

  async getStatus(id: number): Promise<Status | null> {
    const item = new DMSItem({ id });

    if (!item) {
      this.error("getStatus", "item not found", { id });
      return null;
    }

    const status = await item.getStatus();
    return status;
  }

  /** Add "next invalid invoice" button on invoices list */
  private async appendContainer() {
    const ref = await waitPage("DMSDetail");
    const rightList = findElem<HTMLDivElement>("div", "Nom du Fichier").closest("div.w-100");

    if (!this.containerWrapper) {
      this.containerWrapper = parseHTML(`<div class="${rightList.firstElementChild.className}"></div>`)
        .firstElementChild as HTMLDivElement;
      this.containerWrapper.appendChild(this.container);
    }

    rightList.insertBefore(this.containerWrapper, rightList.firstChild);

    waitFunc(() => isPage("DMSDetail") !== ref).then(() => this.appendContainer());
  }

  protected open(id: number) {
    const url = new URL(location.href.replace(/item_id=\d+/, `item_id=${id}`));
    openInTab(url.toString(), { insert: false });
  }
}
