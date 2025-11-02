import { APIDocument } from '../api/Document/index.js';
import Document from './Document.js';

interface Status {
  id: number;
  valid: boolean;
  message: string;
  createdAt: number;
  /** Document.date */
  date: number;
}

export default abstract class ValidableDocument extends Document {
  public valid: boolean | null = null;
  public validMessage: string | null = null;

  protected abstract loadValidMessage(refresh?: boolean): Promise<string>;

  async getValidMessage(refresh = false) {
    if (this.validMessage === null || refresh) await this.loadValidation(refresh);
    return this.validMessage!;
  }

  private async loadValidation(refresh = false) {
    if (this.validMessage === null || refresh) this.validMessage = await this.loadValidMessage(refresh);
    this.valid = this.validMessage === "OK";
  }

  async isValid(refresh = false) {
    if (this.valid === null || refresh) await this.loadValidation(refresh);
    return this.valid!;
  }

  /**
   * Get validation status of the document.
   * @returns The status of the document or null if the document is not found.
   */
  async getStatus(refresh = false): Promise<Status | null> {
    const id = this.id;
    const valid = await this.isValid(refresh);
    const message = await this.getValidMessage(refresh);
    let doc = await this.getFullDocument();
    if (!doc) return null;
    if (!doc.created_at || !doc.date) {
      this.error(`Document incomplet ${this.id}`, { Document: this, doc });
      throw new Error("Document incomplet");
    }
    const createdAt = new Date(doc.created_at).getTime();
    const date = new Date(doc.date).getTime();
    return { id, valid, message, createdAt, date };
  }

  async reloadLedgerEvents(): Promise<APIDocument> {
    this.valid = null;
    this.validMessage = null;
    return super.reloadLedgerEvents();
  }
}
