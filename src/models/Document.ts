import { WEEK_IN_MS } from '../_/time.js';
import { getDMSLinks } from '../api/dms.js';
import { APIDMSLink } from '../api/DMS/Link.js';
import { archiveDocument, getDocument, reloadLedgerEvents } from '../api/document.js';
import { APIDocument } from '../api/Document/index.js';
import { APIGroupedDocument } from "../api/GroupedDocument/index.js";
import { getJournal } from "../api/journal.js";
import { APILedgerEvent } from "../api/LedgerEvent/index.js";
import { getGroupedDocuments, getLedgerEvents } from "../api/operation.js";
import { getThirdparty, type Thirdparty } from "../api/thirdparties.js";
import CacheList from "../framework/CacheList.js";
import { Logger } from "../framework/Logger.js";

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

export const DocumentCache: Map<number, Document> = new Map();

export default class Document extends Logger {
  public type: DocumentType;
  public readonly id: number;
  protected document?: APIDocument | Promise<APIDocument>;
  protected gDocument?: SyncOrPromise<APIGroupedDocument>;
  protected journal?: SyncOrPromise<APIGroupedDocument["journal"]>;
  protected groupedDocuments: SyncOrPromise<Document[]>;
  protected ledgerEvents?: APILedgerEvent[] | Promise<APILedgerEvent[]>;
  protected thirdparty?: Promise<Thirdparty>;
  private static closedCache = new CacheList<ClosedStatus>("closedDocumentsCache", []);

  constructor({ id, ...raw }: { id: number }) {
    super();
    if (!Number.isSafeInteger(id)) {
      this.log("constructor", { id, args: arguments });
      throw new Error("`id` MUST be an integer");
    }
    this.id = id;
    if (isTypedDocument(raw)) this.type = raw.type.toLowerCase() as DocumentType;
    DocumentCache.set(id, this);
  }

  /**
   * Get a document by id, all documents are cached for performance
   */
  public static get(raw: { id: number }): Document {
    if (!DocumentCache.has(raw.id)) {
      return new Document(raw);
    }
    return DocumentCache.get(raw.id)!;
  }

  /**
   * Update a document from an APIGroupedDocument
   */
  public static fromAPIGroupedDocument(apigdoc: APIGroupedDocument): Document {
    const doc = Document.get({ id: apigdoc.id });
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

  async getGdoc(): Promise<APIGroupedDocument | APIDocument> {
    if (this.gDocument) return this.gDocument;
    return this.getDocument();
  }

  async getJournal(): Promise<APIGroupedDocument["journal"]> {
    if (!this.journal) {
      this.journal = this._loadJournal();
    }
    return await this.journal;
  }

  private async _loadJournal(): Promise<APIGroupedDocument["journal"]> {
    const gdoc = await this.getGdoc();
    if ("journal" in gdoc) return gdoc.journal;
    return await getJournal(gdoc.journal_id);
  }

  async getLedgerEvents() {
    if (!this.ledgerEvents) {
      this.ledgerEvents = this._loadLedgerEvents();
    }
    return await this.ledgerEvents;
  }

  private async _loadLedgerEvents() {
    const groupedDocuments = await this.getGroupedDocuments();
    const events = await Promise.all(groupedDocuments.map((doc) => getLedgerEvents(doc.id)));
    this.ledgerEvents = ([] as APILedgerEvent[]).concat(...events);
    return this.ledgerEvents;
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

  async archive(unarchive = false) {
    return await archiveDocument(this.id, unarchive);
  }

  async unarchive() {
    return await this.archive(true);
  }

  async getGroupedDocuments(maxAge?: number) {
    if (!this.groupedDocuments) this.groupedDocuments = this._loadGroupedDocuments(maxAge);
    return await this.groupedDocuments;
  }

  async _loadGroupedDocuments(maxAge?: number): Promise<Document[]> {
    const mainDocument = await this.getDocument();
    if (!mainDocument) {
      this.error(`Document introuvable ${this.id}`);
      return [];
    }
    const otherDocuments = (await getGroupedDocuments(this.id, maxAge)).map((doc) =>
      Document.fromAPIGroupedDocument(doc)
    );
    this.groupedDocuments = [...otherDocuments, this];
    return this.groupedDocuments;
  }

  async getThirdparty(): Promise<Thirdparty["thirdparty"] | null> {
    if (!this.thirdparty) this.thirdparty = this._getThirdparty();
    return (await this.thirdparty)?.thirdparty;
  }

  private async _getThirdparty() {
    const doc = await this.getDocument();
    return await getThirdparty(doc.thirdparty_id);
  }

  public async getDMSLinks(recordType?: string): Promise<APIDMSLink[]> {
    return await getDMSLinks(this.id, recordType);
  }

  public static async isClosed(id: number): Promise<boolean> {
    const cached = this.closedCache.find({ id });
    if (cached && new Date(cached.updatedAt) > new Date(Date.now() - WEEK_IN_MS)) return cached.closed;
    const doc = new Document({ id });
    const closed = await doc.isClosed();
    this.closedCache.updateItem({
      id,
      closed,
      updatedAt: new Date().toISOString(),
    });
    return closed;
  }
}
