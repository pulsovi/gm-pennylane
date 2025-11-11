import { $, waitElem } from "../../_/dom.js";
import { getReactPropValue } from "../../_/react.js";
import { APITransaction } from "../../api/Transaction/index.js";
import CacheStatus, { Status } from "../../framework/CacheStatus.js";
import Service from "../../framework/Service.js";
import ModelFactory from "../../models/Factory.js";
import Transaction from "../../models/Transaction.js";

const statusCache = CacheStatus.getInstance<Status>("transactionValidation");

export default class AddIsValidTransactionListIndicator extends Service {
  async init() {
    this.watch();
    statusCache.on("update", ({ newValue }: { newValue: Status }) => this.updateIndicator(newValue));
  }

  async watch() {
    const checkboxDiv = (await waitElem(
      `div:not(.isValidReady)[data-tracking-action="Accounting Transactions - Row Selection Checkbox"]`
    )) as HTMLDivElement;
    this.debug("found:", checkboxDiv);
    await this.addIndicator(checkboxDiv);
    this.watch();
  }

  async addIndicator(checkboxDiv: HTMLDivElement) {
    const rawTransaction = APITransaction.Create(getReactPropValue(checkboxDiv, "data"));
    const isValid = await this.getIsValid(rawTransaction);
    checkboxDiv.classList.toggle("isValid", isValid);
    checkboxDiv.classList.add("isValidReady");
    checkboxDiv.classList.add(`isValid-${rawTransaction.id}`);
    $("span", checkboxDiv).style.background = isValid ? "#00ff0030" : "#ff000030";
  }

  async getIsValid(transaction: APITransaction) {
    let status = statusCache.find({ id: transaction.id });
    if (status) return status.valid;
    status = await ModelFactory.getTransaction(transaction.id).getStatus();
    statusCache.updateItem({
      id: transaction.id,
      valid: status.valid,
      message: "",
      createdAt: Date.now(),
      date: new Date(transaction.date).getTime(),
    });
    return status.valid;
  }

  private updateIndicator(status: Status) {
    const checkboxDiv = $(`div.isValid-${status.id}`);
    if (!checkboxDiv) return;
    this.debug("handle cache update", status, checkboxDiv);
    checkboxDiv.classList.toggle("isValid", status.valid);
    $("span", checkboxDiv).style.background = status.valid ? "#00ff0030" : "#ff000030";
  }
}
