import CacheList from "./CacheList";

export interface Status {
  createdAt: number;
  fetchedAt: number;
  id: number;
  ignored?: boolean;
  message: string;
  valid: boolean;
}

export default class CacheStatus extends CacheList<Status> {
  private static instances: Record<string, CacheStatus> = {};

  public static getInstance (storageKey: string) {
    if (!this.instances[storageKey]) {
      this.instances[storageKey] = new CacheStatus(storageKey);
    }
    return this.instances[storageKey];
  }

  /**
   * Update one item
   *
   * @return Old value
   */
  public updateItem (match: Partial<Status>, newValue: Status): Status | undefined {
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
