import T_IDBStore from "./Store.js";

export interface T_IDBTransactionOptions<ItemType extends object> {
  database: IDBDatabase;
  table: string;
  mode?: IDBTransactionMode;
  onError?: (error) => void;
}

/**
 * IDBTransaction wrapper with type and state readonly property
 */
export default class T_IDBTransaction<ItemType extends object> {
  public readonly transaction: IDBTransaction;
  public readonly table: string;
  public readonly mode: IDBTransactionMode;
  private _state: "pending" | "completed" | "error" | "aborted" = "pending";
  private readonly options: T_IDBTransactionOptions<ItemType>;

  constructor({ database, table, mode = "readonly", onError }: T_IDBTransactionOptions<ItemType>) {
    this.table = table;
    this.mode = mode;
    this.transaction = database.transaction(this.table, this.mode);
    this.attachEvents(onError);
    this.options = { database, table, mode, onError };
  }

  public get state() {
    return this._state;
  }

  private attachEvents(onError?: (error) => void) {
    this.transaction.oncomplete = () => {
      this._state = "completed";
    };
    this.transaction.onerror = (event) => {
      this._state = "error";
      onError?.(event);
    };
    this.transaction.onabort = () => {
      this._state = "aborted";
    };
  }

  public getStore(): T_IDBStore<ItemType> {
    return new T_IDBStore<ItemType>(this.transaction.objectStore(this.table), this);
  }

  public reload(): T_IDBTransaction<ItemType> {
    return new T_IDBTransaction<ItemType>(this.options);
  }
}
