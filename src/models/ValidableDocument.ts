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

  protected abstract loadValidMessage(): Promise<string>;

  async getValidMessage() {
    if (this.validMessage === null) await this.loadValidation();
    return this.validMessage!;
  }

  private async loadValidation() {
    if (this.validMessage === null) this.validMessage = await this.loadValidMessage();
    this.valid = this.validMessage === "OK";
  }

  async isValid() {
    if (this.valid === null) await this.loadValidation();
    return this.valid!;
  }

  /**
   * Get validation status of the document.
   * @returns The status of the document or null if the document is not found.
   */
  async getStatus(): Promise<Status | null> {
    const id = this.id;
    const valid = await this.isValid();
    const message = await this.getValidMessage();
    const doc = await this.getDocument();
    if (!doc) return null;
    const createdAt = doc && new Date(doc.created_at).getTime();
    const date = doc && new Date(doc.date).getTime();
    return { id, valid, message, createdAt, date };
  }

  async reloadLedgerEvents(): Promise<APIDocument> {
    this.valid = null;
    this.validMessage = null;
    return super.reloadLedgerEvents();
  }
}
