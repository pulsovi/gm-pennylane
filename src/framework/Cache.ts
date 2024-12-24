import Logger from "./Logger";

export default abstract class Cache<T> extends Logger {
  public readonly storageKey: string;

  protected data: T;

  public constructor (key: string, initialValue: T) {
    super();
    this.storageKey = key;
    this.data = initialValue;
    this.load();
    this.debug('new Cache', this);
    this.follow();
  }

  /**
   * Valid and sanitize data from storage
   * throw an Error to reject a value
   */
  protected abstract parse (value: string|null): T;

  /**
   * stringify data for storage
   */
  protected stringify (value: T): string {
    return JSON.stringify(value);
  }

  /**
   * Load data from localStorage
   */
  public load () {
    try {
      this.data = this.parse(localStorage.getItem(this.storageKey));
      this.emit('loadend', this);
    } catch (_error) { /* Reject data and overrid it at next save() */ }
  }

  /**
   * Save data to localStorage
   */
  public save (data?: T) {
    if (data) {
      this.parse(this.stringify(data)); // validate value: throws if invalid
      this.data = data;
    }
    localStorage.setItem(this.storageKey, this.stringify(this.data));
    this.emit('saved', this);
  }

  /**
   * Follow storage change from other Browser pages
   */
  private follow () {
    window.addEventListener('storage', event => {
      if (event.storageArea !== localStorage || event.key !== this.storageKey) return;
      try {
        this.data = this.parse(event.newValue);
        this.emit('change', this);
      } catch (error) {
        this.log('storage event error', { error, value: event.newValue });
        /* Reject data and overrid it at next save() */
      }
    });
  }
}
