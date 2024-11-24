import { findElem, jsonClone, waitFunc } from "../../_";
import { getTransactionsList } from "../../api/transaction";
import { TransactionList } from "../../api/types";
import OpenNextInvalid, { RawStatus as Status } from "../../framework/OpenNextInvalid";
import Transaction from "../../models/Transaction";

export default class NextInvalidTransaction extends OpenNextInvalid {
  public readonly id = 'next-invalid-transaction';
  protected readonly storageKey = 'transactionValidation';
  protected readonly idParamName = 'transaction_id';

  async init () {
    await this.appendContainer();

    // Wait for appending button in the right page before init auto open service
    await super.init();
  }

  protected async *walk (
    params: Record<string, string | number>
  ): AsyncGenerator<Status, undefined, void> {
    if (('page' in params) && !Number.isInteger(params.page)) {
      console.log(this.constructor.name, 'walk', { params });
      throw new Error('The "page" parameter must be a valid integer number');
    }

    let parameters = jsonClone(params);
    parameters.page = parameters.page ?? 1;

    let data: TransactionList | null = null;
    do {
      data = await getTransactionsList(parameters);
      const transactions = data.transactions;
      if (!transactions?.length) return;
      for (const transaction of transactions) yield new Transaction(transaction).getStatus();
      parameters = Object.assign(jsonClone(parameters), { page: Number(parameters.page ?? 0) + 1 });
    } while (true);
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
