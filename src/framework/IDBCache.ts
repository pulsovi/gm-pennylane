import T_IDBCursor, { T_IDBCursorOptions } from "./IDB/Cursor.js";
import T_IDBStore from "./IDB/Store.js";
import P_IDBStore from "./IDB/Store.js";
import T_IDBTransaction from "./IDB/Transaction.js";
import P_IDBTransaction from "./IDB/Transaction.js";
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
  const registered = structure.tables.find((tableItem) => tableItem.name === registering.name);
  if (registered) {
    if (registered.primary !== registering.primary) {
      logger.error(`Table ${registering.name} primary conflict`, { registered, registering });
      throw new Error(`Table ${registering.name} already registered with primary key "${registered.primary}"`);
    }

    if (Boolean(registered.autoIncrement) !== Boolean(registering.autoIncrement)) {
      logger.error(`Table ${registering.name} autoIncrement conflict`, { registered, registering });
      throw new Error(`Table ${registering.name} already registered with autoIncrement "${registered.autoIncrement}"`);
    }

    let versionChange = false;
    registering.indexedColumns?.forEach((column) => {
      if (!registered.indexedColumns?.includes(column)) {
        registered.indexedColumns = [...(registered.indexedColumns || []), column];
        versionChange = true;
      }
    });
    if (!versionChange) return registered;
  } else structure.tables.push(registering);

  structure.version++;
  logger.log("Structure updated", { oldStructure, structure });
  localStorage.setItem(`${DB_NAME}_IDB_structure`, JSON.stringify(structure));
  location.reload();
  return registering;
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

        const upgradeTx = openRequest.transaction;
        if (!upgradeTx) return;
        const store = upgradeTx.objectStore(table.name);
        (table.indexedColumns || []).forEach((column) => {
          if (!store.indexNames.contains(column)) {
            store.createIndex(column, column, { unique: false });
          }
        });
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

  // Compare structure with db
  let error = false;
  structure.tables.forEach((table) => {
    if (!db.objectStoreNames.contains(table.name)) {
      logger.error(`Table "${table.name}" not found in DB`, { structure, db: db.objectStoreNames });
      error = true;
    } else {
      const store = db.transaction(table.name, "readonly").objectStore(table.name);

      // compare primary key
      if (store.keyPath !== table.primary) {
        logger.error(`Primary key mismatch for table "${table.name}"`, { structure: table, db: store });
        error = true;
      }

      // compare indexed columns
      table.indexedColumns?.forEach((column) => {
        if (!store.indexNames.contains(column)) {
          logger.error(`Indexed column "${column}" not found in table "${table.name}"`, {
            structure: table,
            db: store,
          });
          error = true;
        }
      });
    }
  });

  if (error) {
    structure.version++;
    localStorage.setItem(`${DB_NAME}_IDB_structure`, JSON.stringify(structure));
    location.reload();
  }

  return db;
}

export default class IDBCache<
  ItemType extends object & { [C in PrimaryKey]: PrimaryType },
  PrimaryKey extends keyof ItemType & string,
  PrimaryType extends string | number = string
> extends Logger {
  private static instances: Record<string, IDBCache<any, any, any>> = {};
  private readonly broadcastEventManager: BroadcastChannel;
  public readonly tableName: string;
  public readonly primary: PrimaryKey;
  public readonly indexedColumns: string[];
  public readonly loading: Promise<void>;

  protected _db: IDBDatabase | null;

  public constructor(tableName: string, primary: PrimaryKey, indexedColumns?: string[]) {
    super();
    this.tableName = tableName;
    this.primary = primary;
    const structure = registerTable({ name: tableName, primary, indexedColumns });
    this.indexedColumns = structure.indexedColumns;
    this.loading = this.load().then(() => {});
    this.broadcastEventManager = new BroadcastChannel(`IDBCache:${tableName}`);
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

  public get db() {
    if (!this._db) {
      const message = `Database not loaded, please wait for ${this.constructor.name}.loading before using this method.`;
      this.error(message);
      throw new Error(message);
    }
    return this._db;
  }

  /**
   * Load database
   */
  public async load() {
    this.log("Loading database", this.tableName);
    this._db = await getDB();
    this.log("Database loaded", this._db);
    return this._db;
  }

  public async find(paradigm: (item: ItemType) => boolean): Promise<ItemType | null>;
  public async find(match: Partial<ItemType>): Promise<ItemType | null>;
  public async find(matchOrParadigm: Partial<ItemType> | ((item: ItemType) => boolean)): Promise<ItemType | null> {
    if (typeof matchOrParadigm === "function") {
      const paradigm = matchOrParadigm;
      for await (const item of this.walk()) {
        if (!item) return null;
        if (paradigm(item)) return item;
      }
      return null;
    }

    const match = matchOrParadigm;
    if (this.primary in match) return this.get(match[this.primary] as IDBValidKey);

    for await (const item of this.walk()) {
      if (!item) return null;
      if (Object.entries(match).every(([key, value]) => item[key] === value)) return item;
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
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return match[this.primary];
    const store = await this.getStore("readwrite");
    const key = await store?.put(newValue);
    this.bemit("update", { key, oldValue, newValue });
    return key;
  }

  public async delete(match: Partial<ItemType> & { [C in PrimaryKey]: PrimaryType });
  public async delete(id: IDBValidKey);
  public async delete(matchOrId: (Partial<ItemType> & { [C in PrimaryKey]: PrimaryType }) | IDBValidKey) {
    const id =
      typeof matchOrId === "string" || typeof matchOrId === "number"
        ? matchOrId
        : (matchOrId as Partial<ItemType> & { [C in PrimaryKey]: PrimaryType })[this.primary];
    const store = await this.getStore("readwrite");
    await store?.delete(id);
    this.bemit("delete", { key: id });
  }

  public async get(id: IDBValidKey): Promise<ItemType | null> {
    const store = await this.getStore("readonly");
    return await store?.get(id);
  }

  /**
   * Walk through the cache
   *
   * @param mode - "readonly" or "readwrite"
   * @returns an async generator of items, if the store is not found, returns null
   */
  public async *walk(
    options: {
      mode?: "readonly" | "readwrite";
      column?: string;
      sortDirection?: "asc" | "desc";
      value?: ItemType[keyof ItemType];
      operator?: "=" | "<" | ">" | "<=" | ">=" | "!=";
    } = {}
  ): AsyncGenerator<ItemType | null> {
    const cursor = await this.getCursor(options);
    while (cursor.value) {
      yield cursor.value;
      await cursor.continue();
    }
  }

  protected async getStore(mode: "readonly" | "readwrite") {
    const transaction = new T_IDBTransaction<ItemType>({
      database: this.db,
      table: this.tableName,
      mode,
    });
    return transaction.getStore();
  }

  /**
   * Open a cursor on the store
   * @param options - cursor options
   * @param callback - callback function to handle the cursor. The callback function will be called after the first item is found, and after each cursor.continue() call
   * @param onError - error callback function
   */
  protected async getCursor(
    options: T_IDBCursorOptions<ItemType>,
    callback?: (cursor: T_IDBCursor<ItemType> | null) => void,
    onError?: (error: Event) => void
  ) {
    if (options.column && !this.indexedColumns?.includes(options.column)) {
      // This action will trigger a page reload
      registerTable({
        name: this.tableName,
        primary: this.primary,
        indexedColumns: [...(this.indexedColumns ?? []), options.column],
      });
    }
    const store = await this.getStore(options.mode);
    return await store.openCursor(options);
  }

  /**
   * Delete all data in this table
   */
  public async clear() {
    const store = await this.getStore("readwrite");
    return await store?.clear();
  }

  /**
   * Emit broadcast event
   */
  public bemit(event: string, data?: unknown) {
    this.broadcastEventManager.postMessage({ event, data });
  }

  /**
   * Listen to broadcast events
   */
  public bon(event: string, callback: (data?: unknown) => void) {
    this.broadcastEventManager.addEventListener("message", (event) => {
      if (event.data.event === event) callback(event.data.data);
    });
  }
}

function promisify<T>(request: IDBRequest<T>) {
  return new Promise((rs, rj) => {
    request.onsuccess = () => rs(request.result);
    request.onerror = () => rj(request.error);
  });
}
