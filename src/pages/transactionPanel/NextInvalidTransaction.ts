import { findElem, waitFunc } from '../../_/index.js';
import { getTransactionGenerator } from '../../api/transaction.js';
import { APITransactionListParams } from "../../api/Transaction/ListParams.js";
import IDBCache from "../../framework/IDBCache.js";
import OpenNextInvalid, { OpenNextInvalid_ItemStatus as Status } from "../../framework/OpenNextInvalid.js";
import ModelFactory from "../../models/Factory.js";

export default class NextInvalidTransaction extends OpenNextInvalid {
  protected static instance: NextInvalidTransaction;
  public readonly id = "next-invalid-transaction";
  protected readonly storageKey = "transactionValidation";
  protected readonly idParamName = "transaction_id";
  protected cache: IDBCache<Status, "id", number>;

  async init() {
    // Wait for appending button in the matching page before init auto open service
    await this.appendContainer();

    this.cache = IDBCache.getInstance<Status, "id", number>(this.storageKey, "id");
    await super.init();
  }

  protected async *walk(): AsyncGenerator<Status, undefined, void> {
    // Load new added transactions
    const max = await this.cache.reduce((acc, status) => Math.max(status.date, acc), 0);
    if (max) {
      const params: APITransactionListParams = {
        filter: JSON.stringify([{ field: "created_at", operator: "gteq", value: new Date(max).toISOString() }]),
        sort: "+created_at",
      };
      for await (const transaction of getTransactionGenerator(params)) {
        yield ModelFactory.getTransaction(transaction.id).getStatus();
      }
    }

    // Load old unloaded transactions
    const min = await this.cache.reduce((acc, status) => Math.min(status.date, acc), Date.now());
    const params: APITransactionListParams = {
      filter: JSON.stringify([{ field: "created_at", operator: "lteq", value: new Date(min).toISOString() }]),
      sort: "-created_at",
    };
    for await (const transaction of getTransactionGenerator(params)) {
      yield ModelFactory.getTransaction(transaction.id).getStatus();
    }
  }

  async getStatus(id: number, force?: boolean): Promise<Status | null> {
    const transaction = ModelFactory.getTransaction(id);

    return await transaction.getStatus(force);
  }

  /** Add "next invalid transaction" button on transactions list */
  private async appendContainer() {
    const nextButton = await waitFunc(
      () => findElem("div", "Détails")?.querySelector("button+button:last-child") ?? false
    );
    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);
    waitFunc(() => findElem("div", "Détails")?.querySelector("button+button:last-child") !== nextButton).then(() =>
      this.appendContainer()
    );
  }
}
