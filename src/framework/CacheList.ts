import { TypePredicate } from 'typescript';
import Cache from './Cache.js';

export default class CacheList<T> extends Cache<T[]> {
  private static instances: Record<string, CacheList<unknown>> = {};

  public static getInstance <T>(storageKey: string): CacheList<T> {
    if (!this.instances[storageKey]) {
      this.instances[storageKey] = new this<T>(storageKey);
    }
    return this.instances[storageKey] as CacheList<T>;
  }

  public constructor (key: string, initialValue = []) {
    super(key, initialValue);
  }

  protected parse (data: string | null): T[] {
    const value = JSON.parse(data!);
    if (!Array.isArray(value)) throw new Error('The given value does not parse as an Array.');
    return value;
  }

  /**
   * Returns the cached elements that match the condition specified
   */
  public filter (predicate: (item: T) => boolean): T[];
  public filter (match: Partial<T>): T[];
  public filter (matchOrPredicate: ((item: T) => boolean) | Partial<T>): T[] {
    this.load();
    if (typeof matchOrPredicate === 'function')
      return this.data.filter(matchOrPredicate);

    return this.data.filter(
      item => Object.entries(matchOrPredicate).every(
        ([key, value]) => item[key] === value
      )
    );
  }

  /**
   * Returns the first cached element that match condition, and undefined
   * otherwise.
   */
  public find (match: Partial<T>): T | undefined;
  public find <S extends T>(match: (value?: T, index?: number, obj?: T[]) => value is S): S | undefined;
  public find (match: (value?: T, index?: number, obj?: T[]) => boolean): T | undefined;
  public find (match: Partial<T> | ((value?: T, index?: number, obj?: T[]) => boolean)): T | undefined {
    this.load();
    if (typeof match === 'function') return this.data.find(match);
    return this.data.find(
      item => Object.entries(match).every(
        ([key, value]) => item[key] === value
      )
    );
  }

  /**
   * delete one item
   *
   * @return Deleted item if found
   */
  public delete (match: Partial<T>): T | null {
    this.load();
    const found = this.find(match);
    if (!found) return null;
    this.data.splice(this.data.indexOf(found), 1);
    this.emit('delete', { old: found });
    this.save();
    this.emit('change', this);
    return found;
  }

  /**
   * clear all data
   */
  public clear (): this {
    this.data.length = 0;
    this.emit('clear', this);
    this.save();
    this.emit('change', this);
    return this;
  }

  /**
   * Update one item
   *
   * @param create Create the item if no match found
   * @return Old value
   */
  public updateItem (match: Partial<T>, value: T, create = true): T | undefined {
    this.load();
    const item = this.find(match);
    if (item) {
      this.data.splice(this.data.indexOf(item), 1, value);
      this.emit('update', { old: item, new: value });
    } else {
      if (!create) return;
      this.data.push(value);
      this.emit('add', { new: value });
    }
    this.save();
    this.emit('change', this);
    return item;
  }

  /**
   * Calls the specified callback function for all the elements in an array.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   */
  public reduce <R extends unknown>(cb: (acc: R, item: T) => R, startingValue: R): R {
    this.load();
    return this.data.reduce(cb, startingValue);
  }
}
