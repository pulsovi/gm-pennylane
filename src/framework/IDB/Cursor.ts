import Logger from "../Logger.js";
import type T_IDBStore from "./Store.js";

export interface T_IDBCursorOptions<ItemType extends object> {
  mode?: "readonly" | "readwrite";
  column?: string;
  sortDirection?: "asc" | "desc";
  value?: ItemType[keyof ItemType];
  operator?: "=" | "<" | ">" | "<=" | ">=" | "!=";
}
type ConstructorOptions<ItemType extends object> = T_IDBCursorOptions<ItemType> & {
  store: T_IDBStore<ItemType>;
};

export default class T_IDBCursor<ItemType extends object> extends Logger {
  private cursor: IDBCursorWithValue;
  private store: T_IDBStore<ItemType>;
  private readonly options: T_IDBCursorOptions<ItemType>;

  constructor(cursor: IDBCursorWithValue, options: ConstructorOptions<ItemType>) {
    super();
    const { store, ...other } = options;
    this.options = other;
    this.store = store;
    this.cursor = cursor;
  }

  public static parseCursorQuery<ItemType extends object>(
    value: ItemType[keyof ItemType],
    operator: "=" | "<" | ">" | "<=" | ">=" | "!=" = "="
  ): IDBKeyRange | null {
    if (typeof value === "undefined") return null;
    switch (operator) {
      case "=":
        return IDBKeyRange.only(value);
      default:
        throw new Error(`Invalid operator: "${operator}"`);
    }
  }

  public get value(): ItemType {
    return this.cursor?.value;
  }

  public async continue(): Promise<this> {
    if (this.store.transaction.state === "pending") {
      try {
        this.cursor.continue();
        return new Promise<this>((resolve, reject) => {
          this.cursor.request.onerror = reject;
          this.cursor.request.onsuccess = (event) => {
            this.cursor = this.cursor.request.result;
            resolve(this);
          };
        });
      } catch (error) {
        this.error(`continue() Error: error.message`, {
          Cursor: this,
          error,
          store: this.store,
          transaction: this.store.transaction,
          state: this.store.transaction.state,
        });
        if (
          error.message !==
          "A request was placed against a transaction which is currently not active, or which is finished."
        ) {
          this.cursor = null;
          return this;
        }
      }
    }
    const last = this.value;
    const newCursor = await this.reload();
    this.cursor = newCursor.cursor;
    this.store = newCursor.store;
    await this.goto(last);
    return this.continue();
  }

  public async reload(): Promise<T_IDBCursor<ItemType>> {
    const store = this.store.reload();
    const cursor = await store.openCursor(this.options);
    return cursor;
  }

  public goto(item: ItemType): Promise<this> {
    if (this.cursor.source instanceof IDBIndex) {
      const index = this.cursor.source;
      const store = index.objectStore;
      const [indexKey] = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath];
      const [storeKey] = Array.isArray(store.keyPath) ? store.keyPath : [store.keyPath];
      this.cursor.continuePrimaryKey(item[indexKey], item[storeKey]);
    } else {
      const store = this.cursor.source;
      const [primaryKey] = Array.isArray(store.keyPath) ? store.keyPath : [store.keyPath];
      this.cursor.continue(item[primaryKey]);
    }
    return new Promise<this>((resolve, reject) => {
      this.cursor.request.onerror = reject;
      this.cursor.request.onsuccess = (_event) => {
        this.cursor = this.cursor.request.result;
        resolve(this);
      };
    });
  }
}
