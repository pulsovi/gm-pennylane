import type { GroupedDocument, RawDocument, RawLedgerEvent } from '../api/types.d.ts';
import { archiveDocument, getDocument, reloadLedgerEvents } from '../api/document.js';
import { getGroupedDocuments, getLedgerEvents } from '../api/operation.js';

export default class Document {
  public readonly type: 'transaction' | 'invoice';
  public readonly id: number;
  protected document: RawDocument | Promise<RawDocument>;
  protected groupedDocuments: GroupedDocument[] | Promise<GroupedDocument[]>;
  protected ledgerEvents: RawLedgerEvent[] | Promise<RawLedgerEvent[]>;

  constructor ({ id }: { id: number }) {
    this.id = id;
  }

  async getDocument () {
    if (!this.document) {
      const doc = this.document = getDocument(this.id);
      this.document = await doc;
    }
    return this.document;
  }

  async getLedgerEvents () {
    if (!this.ledgerEvents) {
      const events = this.ledgerEvents = this._loadLedgerEvents();
      this.ledgerEvents = await events;
    }
    return this.ledgerEvents;
  }

  private async _loadLedgerEvents () {
    const document = await this.getDocument();
    const events = await Promise.all(document.grouped_documents.map(({id}) => getLedgerEvents(id)));
    return [].concat(...events);
  }

  async reloadLedgerEvents () {
    this.document = reloadLedgerEvents(this.id);
    this.document = await this.document;
    return this.document;
  }

  async archive (unarchive = false) {
    return await archiveDocument(this.id, unarchive);
  }

  async getGroupedDocuments () {
    if (!this.groupedDocuments) {
      const doc = this.groupedDocuments = getGroupedDocuments(this.id);
      this.groupedDocuments = await doc;
    }
    return this.groupedDocuments;
  }
}
