import Cache from './Cache.js';

export default class CacheRecord<T extends object> extends Cache<T> {
  protected parse (data: string | null): T {
    const value = JSON.parse(data!);
    if (!value || typeof value !== 'object')
      throw new Error('The given value does not parse as an Object.');
    return value;
  }

  /**
   * Returns the value of the specified key
   */
  public get (key: keyof T): T[typeof key] {
    return this.data[key];
  }

  /**
   * Update one item
   *
   * @return Old value
   */
  public set (
    key: keyof T,
    valueOrCb: T[typeof key] | ((oldValue: T[typeof key]) => T[typeof key]),
  ): T[typeof key] | undefined {
    const oldValue = this.get(key);
    const newValue = valueOrCb instanceof Function ? valueOrCb(oldValue) : valueOrCb;
    this.data[key] = newValue;
    this.emit('update', { oldValue, newValue });
    this.save();
    this.emit('change', this);
    return oldValue;
  }

  /**
   * Check if the record has a specific key
   *
   * @param key The key to check
   * @return True if the record has the key
   */
  public has (key: keyof T): boolean {
    return key in this.data;
  }
}
