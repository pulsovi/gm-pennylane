import { sleep } from "../_/time.js";
import Logger from "./Logger.js";

const logger = new Logger("IDBCache:global");

interface Table {
  name: string;
  primary: string;
  autoIncrement?: boolean;
  indexedColumns?: string[];
}
const tableDefaults = {
  autoIncrement: false,
  indexedColumns: [],
};
type State = ["pending" | "completed" | "error" | "aborted", Event | null];

const DB_NAME = "GM_Pennylane";

const structure: { version: number; tables: Table[] } = JSON.parse(
  localStorage.getItem(`${DB_NAME}_IDB_structure`) || JSON.stringify({ version: 1, tables: [] })
);
function registerTable(table: Table) {
  const oldStructure = JSON.parse(JSON.stringify(structure));
  const registering = { ...tableDefaults, ...table };
  if (structure.tables.some((tableItem) => tableItem.name === registering.name)) {
    const tableItem = structure.tables.find((tableItem) => tableItem.name === registering.name)!;

    if (tableItem.primary !== registering.primary) {
      logger.error(`Table ${registering.name} primary conflict`, { registered: tableItem, registering });
      throw new Error(`Table ${registering.name} already registered with primary key "${tableItem.primary}"`);
    }

    if (Boolean(tableItem.autoIncrement) !== Boolean(registering.autoIncrement)) {
      logger.error(`Table ${registering.name} autoIncrement conflict`, { registered: tableItem, registering });
      throw new Error(`Table ${registering.name} already registered with autoIncrement "${tableItem.autoIncrement}"`);
    }

    let versionChange = false;
    registering.indexedColumns?.forEach((column) => {
      if (!tableItem.indexedColumns?.includes(column)) {
        tableItem.indexedColumns = [...(tableItem.indexedColumns || []), column];
        versionChange = true;
      }
    });
    if (!versionChange) return;
  } else structure.tables.push(registering);

  structure.version++;
  logger.log("Structure updated", { oldStructure, structure });
  localStorage.setItem(`${DB_NAME}_IDB_structure`, JSON.stringify(structure));
}

async function getDB(): Promise<IDBDatabase | null> {
  const db = await new Promise<IDBDatabase | null>((rs, rj) => {
    const openRequest = indexedDB.open(DB_NAME, structure.version);

    /**
     * Database upgrade needed : DB_VERSION is greather than the current db version
     */
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      structure.tables.forEach((table) => {
        if (!db.objectStoreNames.contains(table.name))
          db.createObjectStore(table.name, { keyPath: table.primary, autoIncrement: table.autoIncrement });
      });
    };

    /**
     * Database open failed
     */
    openRequest.onerror = (event) => {
      console.error("IDB load error : error event", { error: openRequest.error, event });
      rj(new Error("IDB load error : error event"));
    };

    /**
     * Database successfully opened
     */
    openRequest.onsuccess = () => {
      rs(openRequest.result);
    };

    /**
     * There is outdated version of the database open in another tab
     */
    openRequest.onblocked = () => {
      console.error("database blocked", { version: structure.version });
      rj(new Error("database blocked"));
    };
  });

  if (db) {
    /**
     * Database version change : DB_VERSION becomes lower than the current db version
     */
    db.onversionchange = () => {
      console.error("database version change", { structure });
      db.close();
    };
  }

  return db;
}

export default class IDBCache<
  ItemType extends object & { [C in PrimaryKey]: PrimaryType },
  PrimaryKey extends keyof ItemType & string,
  PrimaryType extends string | number = string
> extends Logger {
  private static instances: Record<string, IDBCache<any, any, any>> = {};
  public readonly tableName: string;
  public readonly primary: PrimaryKey;
  public readonly indexedColumns: string[];

  protected db: IDBDatabase | null;
  private readonly loading: Promise<IDBDatabase | null>;

  public constructor(tableName: string, primary: PrimaryKey, indexedColumns?: string[]) {
    super();
    this.tableName = tableName;
    this.primary = primary;
    this.indexedColumns = indexedColumns ?? [];
    registerTable({ name: tableName, primary, indexedColumns });
    this.loading = this.load();
    this.debug("new Cache", this);
  }

  public static getInstance<
    ItemType extends object & { [C in PrimaryKey]: PrimaryType },
    PrimaryKey extends keyof ItemType & string,
    PrimaryType extends string | number = string
  >(tableName: string, primary: PrimaryKey, indexedColumns?: string[]): IDBCache<ItemType, PrimaryKey, PrimaryType> {
    if (!this.instances[tableName]) {
      this.instances[tableName] = new this<ItemType, PrimaryKey, PrimaryType>(tableName, primary, indexedColumns);
    }
    return this.instances[tableName] as IDBCache<ItemType, PrimaryKey, PrimaryType>;
  }

  /**
   * Load database
   */
  public async load() {
    this.log("Loading database", this.tableName);
    this.db = await getDB();
    this.log("Database loaded", this.db);
    return this.db;
  }

  public async find(paradigm: (item: ItemType) => boolean): Promise<ItemType | null>;
  public async find(match: Partial<ItemType>): Promise<ItemType | null>;
  public async find(matchOrParadigm: Partial<ItemType> | ((item: ItemType) => boolean)): Promise<ItemType | null> {
    if (typeof matchOrParadigm === "function") {
      for await (const item of this.walk()) {
        if (!item) return null;
        if (matchOrParadigm(item)) return item;
      }
      return null;
    }

    if (this.primary in matchOrParadigm) return this.get(matchOrParadigm[this.primary] as IDBValidKey);

    for await (const item of this.walk()) {
      if (!item) return null;
      if (Object.entries(matchOrParadigm).every(([key, value]) => item[key] === value)) return item;
    }
    return null;
  }

  public async reduce<ReturnType>(
    callback: (acc: ReturnType, item: ItemType) => ReturnType,
    initialValue: ReturnType
  ): Promise<ReturnType> {
    let acc = initialValue;
    for await (const item of this.walk()) {
      if (!item) continue;
      acc = callback(acc, item);
    }
    return acc;
  }

  public async filter(match: Partial<ItemType>): Promise<ItemType[]>;
  public async filter(paradigm: (item: ItemType) => boolean): Promise<ItemType[]>;
  public async filter(matchOrParadigm: Partial<ItemType> | ((item: ItemType) => boolean)): Promise<ItemType[]> {
    const callback =
      typeof matchOrParadigm === "function"
        ? matchOrParadigm
        : (item: ItemType) => Object.entries(matchOrParadigm).every(([key, value]) => item[key] === value);
    const items: ItemType[] = [];
    for await (const item of this.walk()) {
      if (!item) continue;
      if (callback(item)) items.push(item);
    }
    return items;
  }

  public async update(match: Partial<ItemType> & { [C in PrimaryKey]: PrimaryType }) {
    const oldValue = await this.get(match[this.primary]);
    const newValue = oldValue ? { ...oldValue, ...match } : match;
    const store = await this.getStore("readwrite");
    store.put(newValue);
  }

  public async delete(match: Partial<ItemType> & { [C in PrimaryKey]: PrimaryType }) {
    const store = await this.getStore("readwrite");
    store.delete(match[this.primary]);
  }

  public async get(id: IDBValidKey): Promise<ItemType | null> {
    const store = await this.getStore("readonly");
    const getRequest = store?.get(id);
    return await this.consumeRequest(Object.assign(getRequest, { request: `get(${id})` }));
  }

  protected async getStore(mode: "readonly" | "readwrite"): Promise<IDBObjectStore | null> {
    const db = await this.loading;
    if (!db) return null;
    const transaction = Object.assign(db.transaction(this.tableName, mode), { state: ["pending", null] as State });
    transaction.oncomplete = (event) => {
      transaction.state = ["completed", event];
    };
    transaction.onerror = (event) => {
      transaction.state = ["error", event];
    };
    transaction.onabort = (event) => {
      transaction.state = ["aborted", event];
    };
    const store = transaction.objectStore(this.tableName);
    return store;
  }

  /**
   * Walk through the cache
   *
   * @param mode - "readonly" or "readwrite"
   * @returns an async generator of items, if the store is not found, returns null
   */
  public async *walk({
    mode = "readonly",
    sortDirection = "asc",
    column = void 0,
    value = void 0,
    operator = "=",
  }: {
    mode?: "readonly" | "readwrite";
    column?: string;
    sortDirection?: "asc" | "desc";
    value?: ItemType[keyof ItemType];
    operator?: "=" | "<" | ">" | "<=" | ">=" | "!=";
  } = {}): AsyncGenerator<ItemType | null> {
    if (column && !this.indexedColumns?.includes(column)) {
      registerTable({ name: this.tableName, primary: this.primary, indexedColumns: [...this.indexedColumns, column] });
      location.reload();
      return null;
    }
    const store = await this.getStore(mode);
    const index = column ? store?.index(column) : store;
    const request = getRequest(value, operator);
    const cursorRequest = index?.openCursor(request, sortDirection === "asc" ? "next" : "prev");
    if (!cursorRequest) return null;
    while (true) {
      const cursor = await this.consumeRequest(Object.assign(cursorRequest, { request: "openCursor" }));
      if (!cursor) return null;
      yield cursor.value;
      cursor.continue();
    }
  }

  protected consumeRequest<T>(request: IDBRequest<T> & { request: string }): Promise<T | null> {
    if (!request) return null;
    if (!request.request) console.error("IDBRequest has no request property", request);
    window.getIDBRequests = window.getIDBRequests ?? [];
    if (!window.getIDBRequests.includes(request)) window.getIDBRequests.push(request);
    return new Promise((rs, rj) => {
      request.onsuccess = () => rs(request.result);
      request.onerror = () => rj(request.error);
    });
  }

  /**
   * Delete all data in this table
   */
  public async clear() {
    const store = await this.getStore("readwrite");
    store?.clear();
  }
}

declare global {
  interface Window {
    getIDBRequests: IDBRequest[];
  }
}

function getRequest(value, operator) {
  if (typeof value === "undefined") return;
  if (typeof operator === "undefined") operator = "=";
  switch (operator) {
    case "=":
      return IDBKeyRange.only(value);
    default:
      throw new Error(`Invalid operator: "${operator}"`);
  }
}