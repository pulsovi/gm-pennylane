import { getParam } from "../_";
import CacheList from "./CacheList";

export default class CacheListRecord<T extends object> extends CacheList<T> {
  /**
   * Update one item
   *
   * @param create Create the item if no match found
   * @return Old value
   */
  public updateItem (match: Partial<T>, newValue: T, create = true): T | undefined {
    this.load();
    const oldValue = this.find(match);
    if (oldValue) {
      newValue = {...oldValue, ...newValue};
      this.data.splice(this.data.indexOf(oldValue), 1, newValue);
      if (newValue.id == getParam(location.href, 'id'))
        this.log('updateItem', { match, create, oldValue, newValue, stack: new Error('').stack });
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
