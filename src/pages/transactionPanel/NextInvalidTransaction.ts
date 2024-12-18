import { findElem, jsonClone, waitFunc } from "../../_";
import { getTransactionGenerator, getTransactionsList } from "../../api/transaction";
import { TransactionList, TransactionListParams } from "../../api/types";
import CacheStatus from "../../framework/CacheStatus";
import OpenNextInvalid, { RawStatus as Status } from "../../framework/OpenNextInvalid";
import Transaction from "../../models/Transaction";

export default class NextInvalidTransaction extends OpenNextInvalid {
  public readonly id = 'next-invalid-transaction';
  protected readonly storageKey = 'transactionValidation';
  protected readonly idParamName = 'transaction_id';
  protected cache: CacheStatus;

  async init () {
    // Wait for appending button in the matching page before init auto open service
    await this.appendContainer();

    this.cache = CacheStatus.getInstance(this.storageKey);
    await super.init();
  }

  protected async *walk (): AsyncGenerator<Status, undefined, void> {
    // Load new added transactions
    const max = this.cache.reduce((acc, status) => Math.max(status.createdAt, acc), 0);
    if (max) {
      const params: TransactionListParams = {
        filter: JSON.stringify([{ field: 'created_at', operator: 'gteq', value: new Date(max).toISOString() }]),
        sort: '+created_at',
      };
      for await (const transaction of getTransactionGenerator(params)) {
        yield new Transaction(transaction).getStatus();
      }
    }

    // Load old un loaded transactions
    const min = this.cache.reduce((acc, status) => Math.min(status.createdAt, acc), 0);
    const params: TransactionListParams = {
      filter: JSON.stringify(
        min ? [{ field: 'created_at', operator: 'lteq', value: new Date(min).toISOString() }] : []
      ),
      sort: '-created_at',
    };
    for await (const transaction of getTransactionGenerator(params)) {
      yield new Transaction(transaction).getStatus();
    }
  }

  async getStatus (id: number): Promise<Status|null> {
    const transaction = new Transaction(id);

    return await transaction.getStatus();
  }

  /** Add "next invalid transaction" button on transactions list */
  private async appendContainer () {
    const nextButton = await waitFunc(
      () => findElem('div', 'Détails')?.querySelector('button+button:last-child') ?? false
    );
    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);
    waitFunc(() => findElem('div', 'Détails')?.querySelector('button+button:last-child') !== nextButton)
      .then(() => this.appendContainer());
  }
}
