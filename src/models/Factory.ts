import DMSItem from "./DMSItem.js";
import Invoice from "./Invoice.js";
import Transaction from "./Transaction.js";
import { getDocument } from "../api/document.js";
import Logger from "../framework/Logger.js";
import { getDMSItem } from "../api/dms.js";

const logger = new Logger("ModelFactory");
export default class ModelFactory {
  static store = new Map<number, WeakRef<Transaction | Invoice | DMSItem>>();

  static async get(id: number): Promise<Transaction | Invoice | DMSItem> {
    const existing = this.store.get(id)?.deref();
    if (existing) return existing;
    const document = await getDocument(id);
    if (document) {
      switch (document.type) {
        case "Transaction":
          return this.getTransaction(id);
        case "Invoice":
          return this.getInvoice(id);
        default:
          logger.error(`The given id is not a transaction, invoice or DMS item: ${document?.type} found.`, {
            id,
            document,
          });
          throw new Error(`The given id is not a transaction, invoice or DMS item: ${document?.type} found.`);
      }
    }
    const dms = await getDMSItem(id);
    if (dms) return this.getDMSItem(id);

    logger.error(`The given id is not a transaction, invoice or DMS item.`, { id });
    debugger;
    throw new Error(`The given id is not a transaction, invoice or DMS item.`);
  }

  static getTransaction(id: number): Transaction {
    const existing = this.store.get(id)?.deref();
    if (existing) {
      if (!(existing instanceof Transaction)) {
        throw new Error(`The given id is not a transaction: ${existing.constructor.name} found.`);
      }
      return existing;
    }
    const transaction = new Transaction({ id }, this);
    this.store.set(id, new WeakRef(transaction));
    return transaction;
  }

  static async getInvoice(id: number): Promise<Invoice> {
    const existing = this.store.get(id)?.deref();
    if (existing) {
      if (!(existing instanceof Invoice)) {
        throw new Error(`The given id is not an invoice: ${existing.constructor.name} found.`);
      }
      return existing;
    }
    const invoice = await Invoice.load(id, this);
    this.store.set(id, new WeakRef(invoice));
    return invoice;
  }

  static getDMSItem(id: number): DMSItem {
    const existing = this.store.get(id)?.deref();
    if (existing) {
      if (!(existing instanceof DMSItem)) {
        throw new Error(`The given id is not a DMS item: ${existing.constructor.name} found.`);
      }
      return existing;
    }
    const dmsItem = new DMSItem({ id }, this);
    this.store.set(id, new WeakRef(dmsItem));
    return dmsItem;
  }
}
