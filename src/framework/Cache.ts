import EventEmitter from "./EventEmitter";

export default class Cache<T extends object> extends EventEmitter {
  public readonly storageKey: string;
  private data: T[];

  public constructor (key: string) {
    super();
    this.storageKey = key;
    this.load();
    console.log('new Cache', this);
  }

  /**
   * Load data from localStorage
   */
  public load () {
    this.data = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
    if (!Array.isArray(this.data)) this.data = [];
    this.emit('loadend', this.data);
  }

  /**
   * Save data to localStorage
   */
  public save () {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    this.emit('saved', this.data);
  }

  /**
   * Returns the cached elements that match the condition specified
   */
  public filter (match: Partial<T>) {
    return this.data.filter(
      item => Object.entries(match).every(
        ([key, value]) => item[key] === value
      )
    );
  }

  /**
   * Returns the first cached element that match condition, and undefined
   * otherwise.
   */
  public find (match: Partial<T>) {
    return this.data.find(
      item => Object.entries(match).every(
        ([key, value]) => item[key] === value
      )
    );
  }

  /**
   * delete one item
   */
  public delete (match: Partial<T>) {
    const found = this.find(match);
    if (!found) return;
    this.data.splice(this.data.indexOf(found), 1);
    this.emit('delete', { old: found });
    this.save();
  }

  /**
   * clear all data
   */
  public clear () {
    this.data.length = 0;
    this.save();
    this.emit('clear', this.data);
  }

  /**
   * Update one item
   */
  public updateItem (match: Partial<T>, value: T) {
    const item = this.find(match);
    if (item) {
      this.data.splice(this.data.indexOf(item), 1, value);
      this.emit('update', { old: item, new: value });
    } else {
      this.data.push(value);
      this.emit('add', { new: value });
    }
    this.save();
    return value;
  }

  /**
   * Calls the specified callback function for all the elements in an array.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   */
  public reduce <R extends unknown>(cb: (acc: R, item: T) => R, startingValue: R): R {
    return this.data.reduce(cb, startingValue);
  }
}
