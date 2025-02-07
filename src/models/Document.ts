import type { GroupedDocument, APILedgerEvent, RawDocument, RawThirdparty, APIGroupedDocument } from '../api/types.d.ts';
import { archiveDocument, getDocument, reloadLedgerEvents } from '../api/document.js';
import { getGroupedDocuments, getLedgerEvents } from '../api/operation.js';
import { getThirdparty } from '../api/thirdparties.ts';
import { Logger } from '../framework/Logger.ts';

export default class Document extends Logger {
  public readonly type: 'transaction' | 'invoice';
  public readonly id: number;
  protected document: RawDocument | Promise<RawDocument>;
  protected groupedDocuments: APIGroupedDocument[] | Promise<APIGroupedDocument[]>;
  protected ledgerEvents?: APILedgerEvent[] | Promise<APILedgerEvent[]>;
  protected thirdparty?: Promise<{direction: string; thirdparty: RawThirdparty}>;

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

  async _loadGroupedDocuments (): Promise<APIGroupedDocument[]> {
    const otherDocuments = await getGroupedDocuments(this.id);
    const mainDocument = await this.getDocument();
    this.groupedDocuments = [
      ...otherDocuments,
      mainDocument.grouped_documents.find(doc => doc.id === this.id)!
    ];
    return this.groupedDocuments;
  }

  async getThirdparty (): Promise<RawThirdparty> {
    if (!this.thirdparty)
      this.thirdparty = this._getThirdparty();
    return (await this.thirdparty).thirdparty;
  }

  private async _getThirdparty () {
    const doc = await this.getDocument();
    return await getThirdparty(doc.thirdparty_id);
  }
}
