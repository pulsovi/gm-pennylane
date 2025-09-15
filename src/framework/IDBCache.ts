import { sleep } from "../_/time.js";
import Logger from "./Logger.js";

interface Table {
  name: string;
  primary: string;
  autoIncrement?: boolean;
}
type State = ["pending" | "completed" | "error" | "aborted", Event | null];

const DB_NAME = "GM_Pennylane";
const DB_VERSION = 1;

let registeringTO: Promise<void> | null = null;
const tables: Table[] = [];
function registerTable(table: Table) {
  if (tables.some((tableItem) => tableItem.name === table.name))
    throw new Error(`Table nammed "${table.name}" already exists`);

  tables.push(table);
  registeringTO = sleep(200);
}

let DBLoading;
async function getDB() {
  let end: Promise<void>;
  do {
    end = registeringTO;
    await end;
  } while (end !== registeringTO);

  if (!DBLoading) DBLoading = loadDB();
  return DBLoading;
}

async function loadDB(): Promise<IDBDatabase | null> {
  const db = await new Promise<IDBDatabase | null>((rs, rj) => {
    const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

    /**
     * Database upgrade needed : DB_VERSION is greather than the current db version
     */
    openRequest.onupgradeneeded = (event) => {
      const db = openRequest.result;
      switch (event.oldVersion) {
        case 0:
          tables.forEach((table) => {
            if (!db.objectStoreNames.contains(table.name))
              db.createObjectStore(table.name, { keyPath: table.primary, autoIncrement: table.autoIncrement });
          });
          return;
        default:
          console.log("IDB load error: upgrade needed", { openRequest, event });
          rj(new Error("IDB load error: upgrade needed"));
      }
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
    openRequest.onblocked = (event) => {
      console.error("database blocked", { version: DB_VERSION });
      rj(event);
    };
  });

  if (db) {
    /**
     * Database version change : DB_VERSION becomes lower than the current db version
     */
    db.onversionchange = () => {
      console.error("database version change", { version: DB_VERSION });
      db.close();
    };
  }

  return db;
}

export default class IDBCache<T extends object & { [C in K]: string }, K extends keyof T & string> extends Logger {
  private static instances: Record<string, IDBCache<any, any>> = {};
  public readonly tableName: string;
  public readonly primary: K;

  protected db: IDBDatabase | null;
  private readonly loading: Promise<IDBDatabase | null>;

  public constructor(tableName: string, primary: K) {
    super();
    this.tableName = tableName;
    this.primary = primary;
    registerTable({ name: tableName, primary });
    this.loading = this.load();
    this.debug("new Cache", this);
  }

  public static getInstance<T extends object & { [C in K]: string }, K extends keyof T & string>(
    tableName: string,
    primary: K
  ): IDBCache<T, K> {
    if (!this.instances[tableName]) {
      this.instances[tableName] = new this<T, K>(tableName, primary);
    }
    return this.instances[tableName] as IDBCache<T, K>;
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

  public async find(match: Partial<T>): Promise<T | null> {
    if (this.primary in match) return this.get(match[this.primary] as IDBValidKey);
    for await (const item of this.walk("readonly")) {
      if (!item) return null;
      if (Object.entries(match).every(([key, value]) => item[key] === value)) return item;
    }
    return null;
  }

  public async update(match: Partial<T> & { [C in K]: string }) {
    const oldValue = await this.get(match[this.primary]);
    const newValue = oldValue ? { ...oldValue, ...match } : match;
    const store = await this.getStore("readwrite");
    store.put(newValue);
  }

  public async get(id: IDBValidKey): Promise<T | null> {
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

  protected async *walk(mode: "readonly" | "readwrite"): AsyncGenerator<T | null> {
    const store = await this.getStore(mode);
    const cursorRequest = store?.openCursor();
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
}

declare global {
  interface Window {
    getIDBRequests: IDBRequest[];
  }
}
