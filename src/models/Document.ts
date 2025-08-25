import { WEEK_IN_MS } from '../_/time.js';
import { getDMSLinks } from '../api/dms.js';
import { APIDMSLink } from '../api/DMS/Link.js';
import { archiveDocument, getDocument, reloadLedgerEvents } from '../api/document.js';
import { APIDocument } from '../api/Document/index.js';
import { APILedgerEvent } from '../api/LedgerEvent/index.js';
import { getGroupedDocuments, getLedgerEvents } from '../api/operation.js';
import { getThirdparty, type Thirdparty } from '../api/thirdparties.js';
import { GroupedDocument } from '../api/types.js';
import CacheList from '../framework/CacheList.js';
import { Logger } from '../framework/Logger.js';

interface ClosedStatus {
  id: number;
  closed: boolean;
  updatedAt: string;
}

export default class Document extends Logger {
  public readonly type: 'transaction' | 'invoice';
  public readonly id: number;
  protected document: APIDocument | Promise<APIDocument>;
  protected groupedDocuments: SyncOrPromise<GroupedDocument[]>;
  protected ledgerEvents?: APILedgerEvent[] | Promise<APILedgerEvent[]>;
  protected thirdparty?: Promise<Thirdparty>;
  private static closedCache = new CacheList<ClosedStatus>('closedDocumentsCache', []);

  constructor ({ id }: { id: number }) {
    super();
    if (!Number.isSafeInteger(id)) {
      this.log('constructor', {id, args: arguments});
      throw new Error('`id` MUST be an integer');
    }
    this.id = id;
  }

  async getDocument () {
    if (!this.document) {
      this.document = getDocument(this.id);
      this.document = await this.document;
    }
    return await this.document;
  }

  async getLedgerEvents () {
    if (!this.ledgerEvents) {
      this.ledgerEvents = this._loadLedgerEvents();
    }
    return await this.ledgerEvents;
  }

  private async _loadLedgerEvents () {
    const groupedDocuments = await this.getGroupedDocuments();
    const events = await Promise.all(groupedDocuments.map(
      doc => getLedgerEvents(doc.id)
    ));
    this.ledgerEvents = ([] as APILedgerEvent[]).concat(...events);
    return this.ledgerEvents;
  }

  async reloadLedgerEvents () {
    delete this.ledgerEvents;
    this.document = reloadLedgerEvents(this.id);
    this.document = await this.document;
    return this.document;
  }

  public async isClosed() {
    const ledgerEvents = await this.getLedgerEvents();
    return ledgerEvents.some(event => event.closed);
  }

  async archive (unarchive = false) {
    return await archiveDocument(this.id, unarchive);
  }

  async unarchive () {
    return await this.archive(true);
  }

  async getGroupedDocuments () {
    if (!this.groupedDocuments)
      this.groupedDocuments = this._loadGroupedDocuments();
    return await this.groupedDocuments;
  }

  async _loadGroupedDocuments (): Promise<GroupedDocument[]> {
    const mainDocument = await this.getDocument();
    if (!mainDocument) {
      this.error(`Document introuvable ${this.id}`);
      return [];
    }
    const otherDocuments = await getGroupedDocuments(this.id);
    this.groupedDocuments = [
      ...otherDocuments,
      mainDocument.grouped_documents.find(doc => doc.id === this.id)!
    ];
    return this.groupedDocuments;
  }

  async getThirdparty (): Promise<Thirdparty['thirdparty']|null> {
    if (!this.thirdparty)
      this.thirdparty = this._getThirdparty();
    return (await this.thirdparty)?.thirdparty;
  }

  private async _getThirdparty () {
    const doc = await this.getDocument();
    return await getThirdparty(doc.thirdparty_id);
  }

  public async getDMSLinks(recordType?: string): Promise<APIDMSLink[]> {
    return await getDMSLinks(this.id, recordType);
  }

  public static async isClosed (id: number): Promise<boolean> {
    const cached = this.closedCache.find({ id });
    if (cached && new Date(cached.updatedAt) > new Date(Date.now() - WEEK_IN_MS)) return cached.closed;
    const doc = new Document({ id });
    const closed = await doc.isClosed();
    this.closedCache.updateItem({ id, closed, updatedAt: new Date().toISOString() });
    return closed;
  }
}
