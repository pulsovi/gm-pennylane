import { getParam } from '../_/url.js';
import CacheList from './CacheList.js';

export default class CacheListRecord<T extends object> extends CacheList<T> {
  /**
   * Update one item
   *
   * @param create Create the item if no match found
   * @return Old value
   */
  public updateItem (newValue: T, create?: boolean): typeof newValue extends {id: number} ? T | undefined : never;
  public updateItem (match: Partial<T>, newValue: T, create?: boolean): T | undefined;
  public updateItem (match: Partial<T> | T, newValueOrCreate?: T | boolean, create = true): T | undefined | never {
    let newValue: T;
    if (typeof newValueOrCreate === 'object') {
      newValue = newValueOrCreate;
    } else {
      if (!('id' in match)) throw new ReferenceError('updating without match/newValue pair requires id property');
      create = newValueOrCreate ?? true;
      newValue = match as T;
    }
    this.load();
    const oldValue = this.find(match);
    if (oldValue) {
      newValue = {...oldValue, ...newValue};
      this.data.splice(this.data.indexOf(oldValue), 1, newValue);
      if (('id' in newValue) && newValue.id == getParam(location.href, 'id'))
        this.debug('updateItem', { match, create, oldValue, newValue, stack: new Error('').stack });
      this.emit('update', { oldValue, newValue });
    } else {
      if (!create) return;
      this.data.push(newValue);
      this.emit('add', { newValue });
    }
    this.save();
    this.emit('change', this);
    return oldValue;
  }
}
