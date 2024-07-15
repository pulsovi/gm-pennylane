import { RawDocument } from '../api/types.js';
import Document from './Document.js';

interface Status {
  id: number;
  valid: boolean;
  message: string;
}

export default abstract class ValidableDocument extends Document {
  public valid: boolean | null = null;
  public validMessage: string | null = null;

  protected abstract loadValidMessage (): Promise<string>;

  async getValidMessage () {
    if (this.validMessage === null)
      await this.loadValidation();
    return this.validMessage!;
  }

  private async loadValidation () {
    if (this.validMessage === null)
      this.validMessage = await this.loadValidMessage();
    this.valid = this.validMessage === 'OK';
  }

  async isValid () {
    if (this.valid === null)
      await this.loadValidation();
    return this.valid!;
  }

  async getStatus (): Promise<Status> {
    const id = this.id;
    const valid = await this.isValid();
    const message = await this.getValidMessage();
    return { id, valid, message };
  }

  async reloadLedgerEvents(): Promise<RawDocument> {
    this.valid = null;
    this.validMessage = null;
    return super.reloadLedgerEvents();
  }
}
