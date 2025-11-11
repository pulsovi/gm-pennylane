import T_IDBCursor, { T_IDBCursorOptions as T_IDBCursorOptions } from "./Cursor.js";
import type T_IDBTransaction from "./Transaction.js";

/**
 * Typed IDBObjectStore wrapper
 */
export default class T_IDBStore<ItemType extends object> {
  private readonly store: IDBObjectStore;
  public readonly transaction: T_IDBTransaction<ItemType>;

  constructor(store: IDBObjectStore, transaction: T_IDBTransaction<ItemType>) {
    this.store = store;
    this.transaction = transaction;
  }

  public get(key: IDBValidKey): Promise<ItemType | null> {
    const getRequest = this.store.get(key);
    return this.promisify<ItemType | null>(getRequest);
  }

  public put(value: Partial<ItemType>, key?: IDBValidKey): Promise<IDBValidKey> {
    const putRequest = this.store.put(value, key);
    return this.promisify<IDBValidKey>(putRequest);
  }

  public delete(key: IDBValidKey): Promise<void> {
    const deleteRequest = this.store.delete(key);
    return this.promisify<void>(deleteRequest);
  }

  public clear(): Promise<void> {
    const clearRequest = this.store.clear();
    return this.promisify<void>(clearRequest);
  }

  public async openCursor(options: T_IDBCursorOptions<ItemType>) {
    const index = options.column ? this.store.index(options.column) : this.store;
    const query = T_IDBCursor.parseCursorQuery<ItemType>(options.value, options.operator);
    const cursorRequest = index?.openCursor(query, options.sortDirection === "asc" ? "next" : "prev");
    if (!cursorRequest) return null;
    return new Promise<T_IDBCursor<ItemType> | null>((resolve, reject) => {
      cursorRequest.onerror = reject;
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        resolve(new T_IDBCursor(cursor, { ...options, store: this }));
      };
    });
  }

  public reload(): T_IDBStore<ItemType> {
    const transaction = this.transaction.reload();
    return transaction.getStore();
  }

  private promisify<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
