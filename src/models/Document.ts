import { getDMSLinks } from "../api/dms.js";
import { APIDMSLink } from "../api/DMS/Link.js";
import { archiveDocument, getDocument, getFullDocument, reloadLedgerEvents } from "../api/document.js";
import { APIDocument } from "../api/Document/index.js";
import { getExercise } from "../api/global.js";
import { APIGroupedDocument } from "../api/GroupedDocument/index.js";
import { getDocumentJournal } from "../api/journal.js";
import { APILedgerEvent } from "../api/LedgerEvent/index.js";
import { getGroupedDocuments, getLedgerEvents, getOperation } from "../api/operation.js";
import { APIOperation } from "../api/Operation/index.js";
import { getThirdparty, type Thirdparty } from "../api/thirdparties.js";
import CacheList from "../framework/CacheList.js";
import { Logger } from "../framework/Logger.js";
import ModelFactory from "./Factory.js";

interface ClosedStatus {
  id: number;
  closed: boolean;
  updatedAt: string;
}

type DocumentType = "transaction" | "invoice";

export function isDocumentType(value: string): value is DocumentType {
  return ["transaction", "invoice"].includes(value);
}

export function isTypedDocument(value: unknown): value is { type: DocumentType } {
  return (
    value &&
    "object" === typeof value &&
    "type" in value &&
    "string" === typeof value.type &&
    isDocumentType(value.type.toLowerCase())
  );
}

export default abstract class Document extends Logger {
  public type: DocumentType;
  public readonly id: number;
  protected document?: APIDocument | Promise<APIDocument>;
  protected operation?: SyncOrPromise<APIOperation>;
  protected gDocument?: SyncOrPromise<APIGroupedDocument>;
  protected groupedDocuments: SyncOrPromise<Document[]>;
  protected ledgerEvents?: APILedgerEvent[] | Promise<APILedgerEvent[]>;
  protected thirdparty?: Promise<Thirdparty>;
  protected _dmslinks: SyncOrPromise<APIDMSLink[]>;
  private static closedCache = new CacheList<ClosedStatus>("closedDocumentsCache", []);
  protected readonly factory: typeof ModelFactory;

  constructor({ id, ...raw }: { id: number }, factory: typeof ModelFactory) {
    super();
    this.factory = factory;
    if (!Number.isSafeInteger(id)) {
      this.log("constructor", { id, args: arguments });
      throw new Error("`id` MUST be an integer");
    }
    this.id = id;
    if (isTypedDocument(raw)) this.type = raw.type.toLowerCase() as DocumentType;
  }

  /**
   * Get a document by id, all documents are cached for performance
   */
  public static async get(raw: { id: number }, factory: typeof ModelFactory): Promise<Document> {
    const model = await factory.get(raw.id);
    if (model instanceof Document) return model;
    this.prototype.triggerError(`Expected Document instance for id ${raw.id}, got ${typeof model}`);
  }

  /**
   * Update a document from an APIGroupedDocument
   */
  public static async fromAPIGroupedDocument(
    apigdoc: APIGroupedDocument,
    factory: typeof ModelFactory
  ): Promise<Document> {
    const doc = await Document.get({ id: apigdoc.id }, factory);
    doc.gDocument = apigdoc;
    doc.type = apigdoc.type === "Invoice" ? "invoice" : "transaction";
    return doc;
  }

  async getDocument(maxAge?: number): Promise<APIDocument> {
    if (!this.document || typeof maxAge === "number") {
      this.document = getDocument(this.id, maxAge);
      this.document = await this.document;
    }
    return await this.document;
  }

  async getFullDocument(maxAge?: number) {
    return getFullDocument(this.id, maxAge);
  }

  abstract getLabel(maxAge?: number): Promise<string>;

  async getGdoc(): Promise<APIGroupedDocument | APIDocument> {
    if (this.gDocument) return this.gDocument;
    return this.getDocument();
  }

  async getJournal(maxAge?: number): Promise<APIGroupedDocument["journal"]> {
    return getDocumentJournal(this.id, maxAge);
  }

  async getOperation(): Promise<APIOperation | null> {
    if (!this.operation) {
      this.operation = getOperation(this.id);
      this.operation = await this.operation;
    }
    return await this.operation;
  }

  async getLedgerEvents(maxAge?: number) {
    if (!this.ledgerEvents || typeof maxAge === "number") {
      this.ledgerEvents = new Promise(async (resolve) => {
        const groupedDocuments = await this.getGroupedDocuments(maxAge);
        const events = await Promise.all(groupedDocuments.map((doc) => getLedgerEvents(doc.id, maxAge)));
        this.ledgerEvents = ([] as APILedgerEvent[]).concat(...events);
        resolve(this.ledgerEvents);
      });
    }
    return await this.ledgerEvents;
  }

  async reloadLedgerEvents() {
    delete this.ledgerEvents;
    this.document = reloadLedgerEvents(this.id);
    this.document = await this.document;
    return this.document;
  }

  public async isClosed() {
    const ledgerEvents = await this.getLedgerEvents();
    return ledgerEvents.some((event) => event.closed);
  }

  public async isFrozen() {
    const doc = await this.getFullDocument();
    const exercise = await getExercise(parseInt(doc.date.slice(0, 4)));
    return ["frozen", "closed"].includes(exercise.status);
  }

  async archive(unarchive = false) {
    return await archiveDocument(this.id, unarchive);
  }

  async unarchive() {
    return await this.archive(true);
  }

  async getGroupedDocuments(maxAge?: number) {
    if (!this.groupedDocuments || typeof maxAge === "number") {
      this.groupedDocuments = new Promise(async (resolve) => {
        const mainDocument = await this.getDocument(maxAge);
        if (!mainDocument) {
          this.error(`Document introuvable ${this.id}`);
          resolve([]);
          return;
        }
        const otherDocuments = (await getGroupedDocuments(this.id, maxAge)).map((doc) =>
          Document.fromAPIGroupedDocument(doc, this.factory)
        );
        this.groupedDocuments = [...otherDocuments, this];
        resolve(this.groupedDocuments);
      });
    }
    return await this.groupedDocuments;
  }

  async getThirdparty(): Promise<Thirdparty["thirdparty"] | null> {
    if (!this.thirdparty) this.thirdparty = this._getThirdparty();
    return (await this.thirdparty)?.thirdparty;
  }

  private async _getThirdparty() {
    let doc = await this.getFullDocument();
    debugger;
    if (!doc?.thirdparty_id) {
      doc = await this.getFullDocument(1000);
      if (!doc?.thirdparty_id) {
        this.error(`Thirdparty introuvable ${this.id}`, this);
        return null;
      }
    }
    return await getThirdparty(doc.thirdparty_id);
  }

  public async getDMSLinks(recordType?: string, maxAge?: number): Promise<APIDMSLink[]> {
    if (!this._dmslinks) {
      this._dmslinks = getDMSLinks(this.id, recordType, maxAge);
    }
    return await this._dmslinks;
  }
}
