export default class Balance {
  private _CHQ: number[] = [];
  private _reçu: number[] = [];
  private _transaction: number[] = [];
  private _autre: number[] = [];
  private initialized: string[] = [];

  toJSON (): Record<string, number> {
    return this.initialized.reduce((json, key) => ({ ...json, [key]: this.get(key) }), {});
  }

  public addCHQ (value: number | null) { this.add('CHQ', value); }
  public addAutre (value: number | null) { this.add('autre', value); }
  public addReçu (value: number | null) { this.add('reçu', value); }
  public addTransaction (value: number | null) { this.add('transaction', value); }

  private add (key: string, value: number | null) {
    this.validKey(key);
    if (!this.initialized.includes(key)) this.initialized.push(key);
    if (value === null) return;
    if (typeof value !== 'number') throw TypeError(`value must be number, "${typeof value}" received`);
    this[`_${key}`].push(value);
  }

  public get CHQ (): number { return this.get('CHQ'); }
  public get autre (): number { return this.get('autre'); }
  public get reçu (): number { return this.get('reçu'); }
  public get transaction (): number { return this.get('transaction'); }

  private get(key: string): number {
    this.validKey(key);
    return this[`_${key}`].reduce((a, b) => a + b, 0);
  }

  public hasCHQ (): boolean { return this.has('CHQ'); }
  public hasAutre (): boolean { return this.has('autre'); }
  public hasReçu (): boolean { return this.has('reçu'); }
  public hasTransaction (): boolean { return this.has('transaction'); }

  private has(key: string): boolean {
    this.validKey(key);
    return this[`_${key}`].length > 0;
  }

  private validKey(key: string): void | never {
    if (!['transaction', 'CHQ', 'autre', 'reçu'].includes(key))
      throw new ReferenceError(`La balance ne possède pas de cumul pour "${key}"`);
  }
}
