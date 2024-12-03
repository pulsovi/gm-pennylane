import CacheList from "./CacheList";

export default class CacheListRecord<T extends object> extends CacheList<T> {
  /**
   * Update one item
   *
   * @return Old value
   */
  public updateItem (match: Partial<T>, newValue: T): T | undefined {
    const oldValue = this.find(match);
    if (oldValue) {
      newValue = {...oldValue, ...newValue};
      this.data.splice(this.data.indexOf(oldValue), 1, newValue);
      this.emit('update', { oldValue, newValue });
    } else {
      this.data.push(newValue);
      this.emit('add', { newValue });
    }
    this.save();
    this.emit('change', this);
    return oldValue;
  }
}
